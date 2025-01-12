import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptSkill } from '../entities/manuscript-skill.entity';

export class ManuscriptSkillRepository extends Repository<ManuscriptSkill> {
  constructor(
    @InjectRepository(ManuscriptSkill)
    private readonly manuscriptSkillRepository: Repository<ManuscriptSkill>,
  ) {
    super(
      manuscriptSkillRepository.target,
      manuscriptSkillRepository.manager,
      manuscriptSkillRepository.queryRunner,
    );
  }
}
