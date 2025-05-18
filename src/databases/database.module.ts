import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { Company } from './entities/company.entity';
import { Industry } from './entities/industry.entity';
import { JobSkill } from './entities/job-skill.entity';
import { JobView } from './entities/job-view.entity';
import { CompanyFollow } from './entities/company-follow.entity';
import { CompanyReview } from './entities/company-review.entity';
import { Applicant } from './entities/applicant.entity';
import { ApplicantEducation } from './entities/applicant-education.entity';
import { ApplicantExperience } from './entities/applicant-experience.entity';
import { ApplicantSkill } from './entities/applicant-skill.entity';
import { Application } from './entities/application.entity';
import { CompanySkill } from './entities/company-skill.entity';
import { Job } from './entities/job.entity';
import { ApplicantLocation } from './entities/applicant-location.entity';
import { Wishlist } from './entities/wishlist.entity';
import { ApplicantWorkingModel } from './entities/applicant-working-model';
import { ApplicantIndustry } from './entities/applicant-industry.entity';
import { ApplicantProject } from './entities/applicant-project.entity';
import { ApplicantCertificate } from './entities/applicant-certificate.entity';
import { ApplicantAward } from './entities/applicant-award.entity';
import { ApplicationLocation } from './entities/application-location.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Skill,
      Industry,
      Company,
      CompanyFollow,
      CompanyReview,
      CompanySkill,
      Job,
      JobSkill,
      Wishlist,
      JobView,
      Applicant,
      ApplicantEducation,
      ApplicantExperience,
      ApplicantSkill,
      Application,
      ApplicantLocation,
      ApplicantWorkingModel,
      ApplicantIndustry,
      ApplicantProject,
      ApplicantCertificate,
      ApplicationLocation,
      ApplicantAward,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
