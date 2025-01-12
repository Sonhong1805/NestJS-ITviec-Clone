import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantExperience } from '../entities/applicant-experience.entity';

export class ApplicantExperienceRepository extends Repository<ApplicantExperience> {
  constructor(
    @InjectRepository(ApplicantExperience)
    private readonly applicantExperienceRepository: Repository<ApplicantExperience>,
  ) {
    super(
      applicantExperienceRepository.target,
      applicantExperienceRepository.manager,
      applicantExperienceRepository.queryRunner,
    );
  }
}
