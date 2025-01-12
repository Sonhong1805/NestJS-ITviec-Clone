import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manuscript } from '../entities/manuscript.entity';

export class ManuscriptRepository extends Repository<Manuscript> {
  constructor(
    @InjectRepository(Manuscript)
    private readonly manuscriptRepository: Repository<Manuscript>,
  ) {
    super(
      manuscriptRepository.target,
      manuscriptRepository.manager,
      manuscriptRepository.queryRunner,
    );
  }
}
