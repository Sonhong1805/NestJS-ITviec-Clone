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

  @Column('character varying', { name: 'description', nullable: true })
  description: string | null;

  @Column('boolean', { name: 'is_current_study', nullable: true })
  isCurrentStudy: boolean | null;

  @Column('timestamp without time zone', { name: 'start_date', nullable: true })
  startDate: Date | null;

  @Column('timestamp without time zone', { name: 'end_date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantEducations)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
