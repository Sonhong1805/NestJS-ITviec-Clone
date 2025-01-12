import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptView } from '../entities/manuscript-view.entity';

export class ManuscriptViewRepository extends Repository<ManuscriptView> {
  constructor(
    @InjectRepository(ManuscriptView)
    private readonly manuscriptViewRepository: Repository<ManuscriptView>,
  ) {
    super(
      manuscriptViewRepository.target,
      manuscriptViewRepository.manager,
      manuscriptViewRepository.queryRunner,
    );
  }
}
