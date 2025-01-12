import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyReview } from '../entities/company-review.entity';

export class CompanyReviewRepository extends Repository<CompanyReview> {
  constructor(
    @InjectRepository(CompanyReview)
    private readonly companyReviewRepository: Repository<CompanyReview>,
  ) {
    super(
      companyReviewRepository.target,
      companyReviewRepository.manager,
      companyReviewRepository.queryRunner,
    );
  }
}
