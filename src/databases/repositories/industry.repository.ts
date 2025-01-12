import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../entities/industry.entity';

export class IndustryRepository extends Repository<Industry> {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {
    super(
      industryRepository.target,
      industryRepository.manager,
      industryRepository.queryRunner,
    );
  }
}
