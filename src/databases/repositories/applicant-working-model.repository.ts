import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantWorkingModel } from '../entities/applicant-working-model';

export class ApplicantWorkingModelRepository extends Repository<ApplicantWorkingModel> {
  constructor(
    @InjectRepository(ApplicantWorkingModel)
    private readonly applicantWorkingModelRepository: Repository<ApplicantWorkingModel>,
  ) {
    super(
      applicantWorkingModelRepository.target,
      applicantWorkingModelRepository.manager,
      applicantWorkingModelRepository.queryRunner,
    );
  }
}
