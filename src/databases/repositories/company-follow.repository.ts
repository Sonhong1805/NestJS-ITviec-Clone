import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFollow } from '../entities/company-follow.entity';

export class CompanyFollowRepository extends Repository<CompanyFollow> {
  constructor(
    @InjectRepository(CompanyFollow)
    private readonly companyFollowRepository: Repository<CompanyFollow>,
  ) {
    super(
      companyFollowRepository.target,
      companyFollowRepository.manager,
      companyFollowRepository.queryRunner,
    );
  }
}
