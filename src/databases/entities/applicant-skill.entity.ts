import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Applicant } from './applicant.entity';
import { Skill } from './skill.entity';
import { BaseEntity } from './base.entity';

@Index('applicant_skills_pkey', ['id'], { unique: true })
@Entity('applicant_skills', { schema: 'public' })
export class ApplicantSkill extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'level', nullable: true })
  level: string | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'integer', name: 'skill_id' })
  skillId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantSkills)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;

  @ManyToOne(() => Skill, (skills) => skills.applicantSkills)
  @JoinColumn([{ name: 'skill_id', referencedColumnName: 'id' }])
  skill: Skill;
}
