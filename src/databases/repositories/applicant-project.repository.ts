import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantProject } from '../entities/applicant-project.entity';

export class ApplicantProjectRepository extends Repository<ApplicantProject> {
  constructor(
    @InjectRepository(ApplicantProject)
    private readonly applicantProjectRepository: Repository<ApplicantProject>,
  ) {
    super(
      applicantProjectRepository.target,
      applicantProjectRepository.manager,
      applicantProjectRepository.queryRunner,
    );
  }
}
