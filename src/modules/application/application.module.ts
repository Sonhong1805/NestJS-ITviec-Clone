import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Module({
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    ApplicationRepository,
    ManuscriptRepository,
    ApplicantRepository,
    StorageService,
  ],
})
export class ApplicationModule {}
