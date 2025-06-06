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

@Index('applicant_experiences_pkey', ['id'], { unique: true })
@Entity('applicant_experiences', { schema: 'public' })
export class ApplicantExperience extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column('character varying', { name: 'job_title', nullable: true })
  jobTitle: string | null;

  @Column('character varying', { name: 'company_name', nullable: true })
  companyName: string | null;

  @Column('boolean', { name: 'is_working_here', nullable: true })
  isWorkingHere: boolean | null;

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

  @Column('text', { name: 'project', nullable: true })
  project: string | null;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantExperiences)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
