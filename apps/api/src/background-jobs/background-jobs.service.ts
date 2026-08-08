import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import type { MessageService } from '../auth/message.service.js';

export const EMAIL_QUEUE = 'email';
export const SMS_QUEUE = 'sms';

export type EmailJob = { to: string; subject: string; text: string };
export type SmsJob = { phone: string; text: string };

@Injectable()
export class BackgroundJobsService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(BackgroundJobsService.name);

  private boss?: PgBoss;

  private startPromise?: Promise<PgBoss>;

  async onModuleInit() {
    await this.start();
  }

  async onApplicationShutdown() {
    await this.boss?.stop();
  }

  async sendEmail(data: EmailJob) {
    return (await this.start()).send(EMAIL_QUEUE, data);
  }

  async sendSms(data: SmsJob) {
    return (await this.start()).send(SMS_QUEUE, data);
  }

  async startWorkers(messageService: MessageService) {
    const boss = await this.start();
    await boss.work<EmailJob>(EMAIL_QUEUE, async (jobs) => {
      for (const job of jobs) {
        await messageService.sendEmail(job.data.to, job.data.subject, job.data.text);
      }
    });
    await boss.work<SmsJob>(SMS_QUEUE, async (jobs) => {
      for (const job of jobs) {
        await messageService.sendSms(job.data.phone, job.data.text);
      }
    });
    this.logger.log('Background job workers are listening for email and SMS jobs');
  }

  private async start(): Promise<PgBoss> {
    if (!this.startPromise) {
      this.startPromise = this.connect();
    }
    return this.startPromise;
  }

  private async connect(): Promise<PgBoss> {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required to start background jobs');
    }
    const boss = new PgBoss({
      connectionString,
      schema: process.env.PG_BOSS_SCHEMA ?? 'pgboss',
      application_name: 'starter-background-jobs',
    });
    boss.on('error', (error) => this.logger.error('pg-boss error', error));
    await boss.start();
    await boss.createQueue(EMAIL_QUEUE, {
      retryLimit: 5,
      retryDelay: 10,
      retryBackoff: true,
      expireInSeconds: 5 * 60,
    });
    await boss.createQueue(SMS_QUEUE, {
      retryLimit: 5,
      retryDelay: 10,
      retryBackoff: true,
      expireInSeconds: 2 * 60,
    });
    this.boss = boss;
    this.logger.log('pg-boss started');
    return boss;
  }
}
