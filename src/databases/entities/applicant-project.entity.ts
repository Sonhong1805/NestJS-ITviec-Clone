import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Applicant } from './applicant.entity';
import { BaseEntity } from './base.entity';

@Index('applicant_projects_pkey', ['id'], { unique: true })
@Index('applicant_projects_applicant_id_fkey', ['applicantId'])
@Entity('applicant_projects', { schema: 'public' })
export class ApplicantProject extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

  @Column('boolean', { name: 'is_working_on_project', nullable: true })
  isWorkingOnProject: boolean | null;

  @Column('integer', { name: 'from_month', nullable: true })
  fromMonth: string | null;

  @Column('integer', { name: 'from_year', nullable: true })
  fromYear: string | null;

  @Column('integer', { name: 'to_month', nullable: true })
  toMonth: string | null;

  @Column('integer', { name: 'to_year', nullable: true })
  toYear: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('character varying', { name: 'url', nullable: true })
  url: string | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantProjects)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
