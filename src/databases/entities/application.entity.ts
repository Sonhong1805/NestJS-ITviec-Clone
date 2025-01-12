import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Applicant } from './applicant.entity';
import { Manuscript } from './manuscript.entity';
import { BaseEntity } from './base.entity';

@Index('applications_pkey', ['id'], { unique: true })
@Entity('applications', { schema: 'public' })
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

  @Column('character varying', { name: 'phone', nullable: true })
  phone: string | null;

  @Column('character varying', { name: 'resume', nullable: true })
  resume: string | null;

  @Column('character varying', { name: 'status', nullable: true })
  status: string | null;

  @Column('character varying', { name: 'cover_letter', nullable: true })
  coverLetter: string | null;

  @Column('character varying', { name: 'prefer_work_location', nullable: true })
  preferWorkLocation: string | null;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'integer', name: 'manuscript_id' })
  manuscriptId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applications)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;

  @ManyToOne(() => Manuscript, (manuscripts) => manuscripts.applications)
  @JoinColumn([{ name: 'manuscript_id', referencedColumnName: 'id' }])
  manuscript: Manuscript;
}
