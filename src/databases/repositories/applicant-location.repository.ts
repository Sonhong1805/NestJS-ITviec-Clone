import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantLocation } from '../entities/applicant-location.entity';

export class ApplicantLocationRepository extends Repository<ApplicantLocation> {
  constructor(
    @InjectRepository(ApplicantLocation)
    private readonly applicantLocationRepository: Repository<ApplicantLocation>,
  ) {
    super(
      applicantLocationRepository.target,
      applicantLocationRepository.manager,
      applicantLocationRepository.queryRunner,
    );
  }
}
