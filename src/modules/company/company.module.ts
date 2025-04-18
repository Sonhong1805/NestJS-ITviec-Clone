import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { StorageService } from '../storage/storage.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';
import { CompanyReviewRepository } from 'src/databases/repositories/company-review.repository';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { CompanySkillRepository } from 'src/databases/repositories/company-skill.repository';
import { CompanyFollowRepository } from 'src/databases/repositories/company-follow.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    StorageService,
    IndustryRepository,
    CompanyReviewRepository,
    UserRepository,
    CompanySkillRepository,
    CompanyFollowRepository,
    JobRepository,
  ],
})
export class CompanyModule {}
