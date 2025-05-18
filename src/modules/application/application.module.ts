import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { UserRepository } from 'src/databases/repositories/user.repository';

@Module({
  imports: [MailModule, BullModule],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ApplicationRepository,
    JobRepository,
    ApplicantRepository,
    StorageService,
    ApplicantLocationRepository,
    CompanyRepository,
    MailService,
    UserRepository,
  ],
})
export class ApplicationModule {}
