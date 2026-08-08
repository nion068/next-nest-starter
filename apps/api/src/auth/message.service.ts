import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  async sendEmail(to: string, subject: string, text: string) {
    if (!process.env.SMTP_HOST) return void this.logger.log(`email to ${to}: ${subject} ${text}`);
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 1025), secure: false });
    await transport.sendMail({ from: process.env.SMTP_FROM ?? 'no-reply@example.test', to, subject, text });
  }
  async sendSms(phone: string, text: string) {
    // Replace this adapter with Twilio, Vonage, etc. through configuration in production.
    this.logger.log(`SMS (${process.env.SMS_PROVIDER ?? 'console'}) to ${phone}: ${text}`);
  }
}
