import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { JobSkillRepository } from 'src/databases/repositories/job-skill.repository';
import { ResdisService } from '../redis/redis.service';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { JobSaveRepository } from 'src/databases/repositories/job-save.repository';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [JobController],
  providers: [
    JobService,
    JobRepository,
    CompanyRepository,
    JobSkillRepository,
    ResdisService,
    JobViewRepository,
    JobSaveRepository,
    StorageService,
  ],
})
export class JobModule {}
