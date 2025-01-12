import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptSave } from '../entities/manuscript-save.entity';

export class ManuscriptSaveRepository extends Repository<ManuscriptSave> {
  constructor(
    @InjectRepository(ManuscriptSave)
    private readonly manuscriptSaveRepository: Repository<ManuscriptSave>,
  ) {
    super(
      manuscriptSaveRepository.target,
      manuscriptSaveRepository.manager,
      manuscriptSaveRepository.queryRunner,
    );
  }
}
