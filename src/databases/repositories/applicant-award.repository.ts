import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantAward } from '../entities/applicant-award.entity';

export class ApplicantAwardRepository extends Repository<ApplicantAward> {
  constructor(
    @InjectRepository(ApplicantAward)
    private readonly applicantAwardRepository: Repository<ApplicantAward>,
  ) {
    super(
      applicantAwardRepository.target,
      applicantAwardRepository.manager,
      applicantAwardRepository.queryRunner,
    );
  }
}
