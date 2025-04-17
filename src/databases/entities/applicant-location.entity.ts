import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Applicant } from './applicant.entity';

@Index('applicant_locations_pkey', ['id'], { unique: true })
@Index('applicant_locations_applicant_id_fkey1', ['applicantId'])
@Entity('applicant_locations', { schema: 'public' })
export class ApplicantLocation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'applicant_id', nullable: true })
  applicantId: number | null;

  @Column('character varying', { name: 'location', nullable: true })
  location: string | null;

  @ManyToOne(() => Applicant, (applicant) => applicant.applicantLocations)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
