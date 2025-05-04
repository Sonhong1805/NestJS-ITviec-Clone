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

@Index('applicant_certificates_pkey', ['id'], { unique: true })
@Index('applicant_certificates_applicant_id_fkey', ['applicantId'])
@Entity('applicant_certificates', { schema: 'public' })
export class ApplicantCertificate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

  @Column('character varying', { name: 'organization', nullable: true })
  organization: string | null;

  @Column('integer', { name: 'month', nullable: true })
  month: string | null;

  @Column('integer', { name: 'year', nullable: true })
  year: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('character varying', { name: 'url', nullable: true })
  url: string | null;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantCertificates)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
