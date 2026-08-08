import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MessageService } from './auth/message.service.js';
import { BackgroundJobsService } from './background-jobs/background-jobs.service.js';
import './telemetry.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  await app.get(BackgroundJobsService).startWorkers(app.get(MessageService));
}

void bootstrap();
