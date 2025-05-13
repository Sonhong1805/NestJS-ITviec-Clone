import { Module } from '@nestjs/common';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';
import { ApplicantWorkingModelRepository } from 'src/databases/repositories/applicant-working-model.repository';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { ApplicantEducationRepository } from 'src/databases/repositories/applicant-education.repository';
import { ApplicantExperienceRepository } from 'src/databases/repositories/applicant-experience.repository';
import { ApplicantProjectRepository } from 'src/databases/repositories/applicant-project.repository';
import { ApplicantCertificateRepository } from 'src/databases/repositories/applicant-certificate.repository';
import { ApplicantAwardRepository } from 'src/databases/repositories/applicant-award.repository';
import { WishlistRepository } from 'src/databases/repositories/wishlist.repository';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';

@Module({
  controllers: [ApplicantController],
  providers: [
    StorageService,
    ApplicantService,
    ApplicantRepository,
    ApplicantSkillRepository,
    ApplicantExperienceRepository,
    ApplicantLocationRepository,
    ApplicantWorkingModelRepository,
    ApplicantCertificateRepository,
    ApplicantEducationRepository,
    ApplicantProjectRepository,
    ApplicantAwardRepository,
    ApplicationRepository,
    WishlistRepository,
    JobViewRepository,
    UserRepository,
  ],
})
export class ApplicantModule {}
