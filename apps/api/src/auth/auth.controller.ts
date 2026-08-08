import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import {
  EmailCodeDto,
  LoginDto,
  PhoneDto,
  PhoneLoginDto,
  RegisterDto,
  ResetPasswordDto,
  TargetDto,
} from './dto.js';
type CookieReply = {
  setCookie(name: string, value: string, options: Record<string, unknown>): CookieReply;
  clearCookie(name: string, options: Record<string, unknown>): CookieReply;
};
type CookieRequest = { cookies: Record<string, string | undefined> };
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private cookies(reply: CookieReply, tokens: { accessToken: string; refreshToken: string }) {
    const secure = process.env.NODE_ENV === 'production';
    reply.setCookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    });
    reply.setCookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 2_592_000,
    });
    return { ok: true };
  }

  @Post('register') register(@Body() input: RegisterDto) {
    return this.auth.register(input);
  }

  @HttpCode(200) @Post('login') async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return this.cookies(reply, await this.auth.login(input));
  }

  @HttpCode(200) @Post('refresh') async refresh(
    @Res({ passthrough: true }) reply: CookieReply,
    req: CookieRequest,
  ) {
    return this.cookies(reply, await this.auth.refresh(req.cookies.refresh_token ?? ''));
  }

  @HttpCode(204) @Post('logout') async logout(
    @Res({ passthrough: true }) reply: CookieReply,
    req: CookieRequest,
  ) {
    await this.auth.logout(req.cookies.refresh_token);
    reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/api/v1/auth' });
  }

  @HttpCode(204) @Post('email/verify') async verify(@Body() input: EmailCodeDto) {
    await this.auth.verifyEmail(input.email.toLowerCase(), input.code);
  }

  @HttpCode(204) @Post('password/reset/request') async reset(@Body() input: TargetDto) {
    await this.auth.requestPasswordReset(input.email);
  }

  @HttpCode(204) @Post('password/reset/confirm') async resetConfirm(
    @Body() input: ResetPasswordDto,
  ) {
    await this.auth.resetPassword(input.email, input.code, input.password);
  }

  @HttpCode(204) @Post('phone/code') async phoneCode(@Body() input: PhoneDto) {
    await this.auth.requestPhoneCode(input.phone);
  }

  @HttpCode(200) @Post('phone/login') async phoneLogin(
    @Body() input: PhoneLoginDto,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    return this.cookies(reply, await this.auth.loginPhone(input.phone, input.code));
  }
}
