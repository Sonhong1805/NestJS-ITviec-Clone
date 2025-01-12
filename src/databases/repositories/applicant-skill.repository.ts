import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantSkill } from '../entities/applicant-skill.entity';

export class ApplicantSkillRepository extends Repository<ApplicantSkill> {
  constructor(
    @InjectRepository(ApplicantSkill)
    private readonly applicantSkillRepository: Repository<ApplicantSkill>,
  ) {
    super(
      applicantSkillRepository.target,
      applicantSkillRepository.manager,
      applicantSkillRepository.queryRunner,
    );
  }
}
