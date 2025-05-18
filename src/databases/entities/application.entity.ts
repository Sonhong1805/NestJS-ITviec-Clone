import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Applicant } from './applicant.entity';
import { BaseEntity } from './base.entity';
import { Job } from './job.entity';
import { ApplicationLocation } from './application-location.entity';

@Index('applications_pkey', ['id'], { unique: true })
@Entity('applications', { schema: 'public' })
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'cv', nullable: true })
  cv: string | null;

  @Column('character varying', { name: 'full_name', nullable: true })
  fullName: string | null;

  @Column('character varying', { name: 'phone_number', nullable: true })
  phoneNumber: string | null;

  @Column('text', { name: 'cover_letter', nullable: true })
  coverLetter: string | null;

  @Column('character varying', { name: 'status', nullable: true })
  status: string | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'integer', name: 'job_id' })
  jobId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applications)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;

  @ManyToOne(() => Job, (jobs) => jobs.applications)
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'id' }])
  job: Job;

  @OneToMany(
    () => ApplicationLocation,
    (ApplicationLocation) => ApplicationLocation.application,
  )
  applicationLocations: ApplicationLocation[];
}
