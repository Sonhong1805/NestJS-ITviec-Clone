import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from '../entities/applicant.entity';

export class ApplicantRepository extends Repository<Applicant> {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {
    super(
      applicantRepository.target,
      applicantRepository.manager,
      applicantRepository.queryRunner,
    );
  }
}
