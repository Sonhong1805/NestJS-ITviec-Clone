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

@Index('job_skills_pkey', ['id'], { unique: true })
@Entity('job_skills', { schema: 'public' })
export class JobSkill extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'skill_id', nullable: true, unique: true })
  skillId: number | null;

  @Column('integer', { name: 'job_id', nullable: true, unique: true })
  jobId: number | null;

  @ManyToOne(() => Job, (jobs) => jobs.jobSkills)
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'id' }])
  job: Job;

  @ManyToOne(() => Skill, (skills) => skills.jobSkills)
  @JoinColumn([{ name: 'skill_id', referencedColumnName: 'id' }])
  skill: Skill;
}
