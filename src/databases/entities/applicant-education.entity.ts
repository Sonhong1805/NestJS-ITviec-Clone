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

@Index('applicant_educations_pkey', ['id'], { unique: true })
@Entity('applicant_educations', { schema: 'public' })
export class ApplicantEducation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'school', nullable: true })
  school: string | null;

  @Column('character varying', { name: 'major', nullable: true })
  major: string | null;

  @Column('boolean', { name: 'is_current_study', nullable: true })
  isCurrentStudy: boolean | null;

  @Column('integer', { name: 'from_month', nullable: true })
  fromMonth: string | null;

  @Column('integer', { name: 'from_year', nullable: true })
  fromYear: string | null;

  @Column('integer', { name: 'to_month', nullable: true })
  toMonth: string | null;

  @Column('integer', { name: 'to_year', nullable: true })
  toYear: string | null;

  @Column('character varying', { name: 'additional_details', nullable: true })
  additionalDetails: string | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantEducations)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
