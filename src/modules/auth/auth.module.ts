import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, ApplicationRepository],
})
export class AuthModule {}
