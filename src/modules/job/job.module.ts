import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { JobSkillRepository } from 'src/databases/repositories/job-skill.repository';
import { ResdisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { WishlistRepository } from 'src/databases/repositories/wishlist.repository';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { SkillRepository } from 'src/databases/repositories/skill.repository';

@Module({
  controllers: [JobController],
  providers: [
    JobService,
    JobRepository,
    CompanyRepository,
    JobSkillRepository,
    JobViewRepository,
    ResdisService,
    WishlistRepository,
    StorageService,
    ApplicationRepository,
    ApplicantRepository,
    SkillRepository,
  ],
})
export class JobModule {}
