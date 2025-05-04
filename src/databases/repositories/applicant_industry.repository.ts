import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantIndustry } from '../entities/applicant-industry.entity';

export class ApplicantIndustryRepository extends Repository<ApplicantIndustry> {
  constructor(
    @InjectRepository(ApplicantIndustry)
    private readonly applicantIndustryRepository: Repository<ApplicantIndustry>,
  ) {
    super(
      applicantIndustryRepository.target,
      applicantIndustryRepository.manager,
      applicantIndustryRepository.queryRunner,
    );
  }
}
