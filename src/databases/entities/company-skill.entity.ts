import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { BaseEntity } from './base.entity';
import { Job } from './job.entity';
import { Company } from './company.entity';

@Index('company_skills_pkey', ['id'], { unique: true })
@Entity('company_skills', { schema: 'public' })
export class CompanySkill extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'skill_id', nullable: true, unique: true })
  skillId: number | null;

  @Column('integer', { name: 'company_id', nullable: true, unique: true })
  companyId: number | null;

  @ManyToOne(() => Company, (companies) => companies.companySkills)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;

  @ManyToOne(() => Skill, (skills) => skills.jobSkills)
  @JoinColumn([{ name: 'skill_id', referencedColumnName: 'id' }])
  skill: Skill;
}
