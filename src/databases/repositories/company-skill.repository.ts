import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySkill } from '../entities/company-skill.entity';

export class CompanySkillRepository extends Repository<CompanySkill> {
  constructor(
    @InjectRepository(CompanySkill)
    private readonly companySkillRepository: Repository<CompanySkill>,
  ) {
    super(
      companySkillRepository.target,
      companySkillRepository.manager,
      companySkillRepository.queryRunner,
    );
  }
}
