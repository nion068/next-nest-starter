import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BackgroundJobsModule } from '../background-jobs/background-jobs.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { MessageService } from './message.service.js';
import { RolesGuard } from './roles.guard.js';
@Module({
  imports: [JwtModule.register({}), BackgroundJobsModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, MessageService],
})
export class AuthModule {}
