import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { MessageService } from './message.service.js';
import { RolesGuard } from './roles.guard.js';
@Module({ imports: [JwtModule.register({})], controllers: [AuthController], providers: [AuthService, AuthGuard, RolesGuard, MessageService] })
export class AuthModule {}
