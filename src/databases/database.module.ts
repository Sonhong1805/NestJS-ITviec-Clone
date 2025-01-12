import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { Company } from './entities/company.entity';
import { Industry } from './entities/industry.entity';
import { Manuscript } from './entities/manuscript.entity';
import { ManuscriptSkill } from './entities/manuscript-skill.entity';
import { ManuscriptSave } from './entities/manuscript-save.entity';
import { ManuscriptView } from './entities/manuscript-view.entity';
import { CompanyFollow } from './entities/company-follow.entity';
import { CompanyReview } from './entities/company-review.entity';
import { Applicant } from './entities/applicant.entity';
import { ApplicantEducation } from './entities/applicant-education.entity';
import { ApplicantExperience } from './entities/applicant-experience.entity';
import { ApplicantSkill } from './entities/applicant-skill.entity';
import { Application } from './entities/application.entity';

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
      Manuscript,
      ManuscriptSkill,
      ManuscriptSave,
      ManuscriptView,
      Applicant,
      ApplicantEducation,
      ApplicantExperience,
      ApplicantSkill,
      Application,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
