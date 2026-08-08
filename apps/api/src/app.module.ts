import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { BackgroundJobsModule } from './background-jobs/background-jobs.module.js';
import { HealthController } from './health.controller.js';
import { PrismaModule } from './prisma.module.js';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, BackgroundJobsModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
