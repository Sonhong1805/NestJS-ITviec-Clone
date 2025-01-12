import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

export class CompanyRepository extends Repository<Company> {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super(
      companyRepository.target,
      companyRepository.manager,
      companyRepository.queryRunner,
    );
  }
}
