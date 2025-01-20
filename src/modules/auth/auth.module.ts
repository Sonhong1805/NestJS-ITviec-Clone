import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    ApplicantRepository,
    JwtService,
    CompanyRepository,
    MailService,
  ],
})
export class AuthModule {}
