import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantCertificate } from '../entities/applicant-certificate.entity';

export class ApplicantCertificateRepository extends Repository<ApplicantCertificate> {
  constructor(
    @InjectRepository(ApplicantCertificate)
    private readonly applicantCertificateRepository: Repository<ApplicantCertificate>,
  ) {
    super(
      applicantCertificateRepository.target,
      applicantCertificateRepository.manager,
      applicantCertificateRepository.queryRunner,
    );
  }
}
