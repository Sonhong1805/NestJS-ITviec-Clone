import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';

@Module({
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ApplicationRepository,
    JobRepository,
    ApplicantRepository,
    StorageService,
    ApplicantLocationRepository,
  ],
})
export class ApplicationModule {}
