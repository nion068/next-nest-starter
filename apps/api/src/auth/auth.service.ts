import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, VerificationPurpose } from '@prisma/client';
import argon2 from 'argon2';
import { randomInt, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import { BackgroundJobsService } from '../background-jobs/background-jobs.service.js';
import { LoginDto, RegisterDto } from './dto.js';

type Tokens = { accessToken: string; refreshToken: string };
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private backgroundJobs: BackgroundJobsService,
  ) {}

  private code() {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }

  private async challenge(purpose: VerificationPurpose, target: string, userId?: string) {
    const code = this.code();
    await this.prisma.verificationChallenge.create({
      data: {
        purpose,
        target,
        userId,
        codeHash: await argon2.hash(code),
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
    return code;
  }

  async register(input: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email.toLowerCase() },
          ...(input.phone ? [{ phone: input.phone }] : []),
        ],
      },
    });
    if (exists) {
      throw new ConflictException('Email or phone is already registered');
    }
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: await argon2.hash(input.password),
      },
    });
    const code = await this.challenge(VerificationPurpose.EMAIL_VERIFY, user.email, user.id);
    await this.backgroundJobs.sendEmail({
      to: user.email,
      subject: 'Verify your email',
      text: `Your verification code is ${code}`,
    });
    return { id: user.id, email: user.email };
  }

  async login(input: LoginDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.role);
  }

  private async issueTokens(userId: string, role: Role): Promise<Tokens> {
    const session = await this.prisma.session.create({
      data: { tokenHash: randomUUID(), userId, expiresAt: new Date(Date.now() + 30 * 86_400_000) },
    });
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, sid: session.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' },
    );
    await this.prisma.session.update({
      where: { id: session.id },
      data: { tokenHash: await argon2.hash(refreshToken) },
    });
    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });
      if (
        !session ||
        session.revokedAt ||
        session.expiresAt < new Date() ||
        !(await argon2.verify(session.tokenHash, token))
      ) {
        throw new Error();
      }
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return this.issueTokens(session.userId, session.user.role);
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }

  async logout(token?: string) {
    if (!token) {
      return;
    }
    try {
      const { sid } = await this.jwt.verifyAsync<{ sid: string }>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      await this.prisma.session.updateMany({ where: { id: sid }, data: { revokedAt: new Date() } });
    } catch {
      /* clear client cookie regardless */
    }
  }

  async verifyEmail(email: string, code: string) {
    const record = await this.consume(VerificationPurpose.EMAIL_VERIFY, email, code);
    if (!record.userId) {
      throw new UnauthorizedException();
    }
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const code = await this.challenge(VerificationPurpose.PASSWORD_RESET, user.email, user.id);
      await this.backgroundJobs.sendEmail({
        to: user.email,
        subject: 'Password reset',
        text: `Your reset code is ${code}`,
      });
    }
  }

  async resetPassword(email: string, code: string, password: string) {
    const record = await this.consume(
      VerificationPurpose.PASSWORD_RESET,
      email.toLowerCase(),
      code,
    );
    if (!record.userId) {
      throw new UnauthorizedException();
    }
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await argon2.hash(password) },
    });
    await this.prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestPhoneCode(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('No account exists for this phone');
    }
    const code = await this.challenge(VerificationPurpose.PHONE_LOGIN, phone, user.id);
    await this.backgroundJobs.sendSms({ phone, text: `Your sign-in code is ${code}` });
  }

  async loginPhone(phone: string, code: string) {
    const record = await this.consume(VerificationPurpose.PHONE_LOGIN, phone, code);
    if (!record.userId) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: record.userId } });
    return this.issueTokens(user.id, user.role);
  }

  private async consume(purpose: VerificationPurpose, target: string, code: string) {
    const record = await this.prisma.verificationChallenge.findFirst({
      where: { purpose, target, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.attempts >= 5 || !(await argon2.verify(record.codeHash, code))) {
      if (record) {
        await this.prisma.verificationChallenge.update({
          where: { id: record.id },
          data: { attempts: { increment: 1 } },
        });
      }
      throw new UnauthorizedException('Invalid or expired code');
    }
    return this.prisma.verificationChallenge.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  }
}
