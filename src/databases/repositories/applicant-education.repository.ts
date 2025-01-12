import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantEducation } from '../entities/applicant-education.entity';

export class ApplicantEducationRepository extends Repository<ApplicantEducation> {
  constructor(
    @InjectRepository(ApplicantEducation)
    private readonly applicantEducationRepository: Repository<ApplicantEducation>,
  ) {
    super(
      applicantEducationRepository.target,
      applicantEducationRepository.manager,
      applicantEducationRepository.queryRunner,
    );
  }
}
