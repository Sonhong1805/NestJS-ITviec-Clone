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

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'company_name', nullable: true })
  companyName: string | null;

  @Column('character varying', { name: 'description', nullable: true })
  description: string | null;

  @Column('boolean', { name: 'is_working_here', nullable: true })
  isWorkingHere: boolean | null;

  @Column('timestamp without time zone', { name: 'start_date', nullable: true })
  startDate: Date | null;

  @Column('timestamp without time zone', { name: 'end_date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantExperiences)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
