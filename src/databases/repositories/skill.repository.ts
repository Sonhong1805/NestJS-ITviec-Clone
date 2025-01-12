import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';

export class SkillRepository extends Repository<Skill> {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {
    super(
      skillRepository.target,
      skillRepository.manager,
      skillRepository.queryRunner,
    );
  }
}
