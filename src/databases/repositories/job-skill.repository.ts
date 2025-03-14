import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSkill } from '../entities/job-skill.entity';

export class JobSkillRepository extends Repository<JobSkill> {
  constructor(
    @InjectRepository(JobSkill)
    private readonly JobSkillRepository: Repository<JobSkill>,
  ) {
    super(
      JobSkillRepository.target,
      JobSkillRepository.manager,
      JobSkillRepository.queryRunner,
    );
  }
}
