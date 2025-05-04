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

@Index('applicant_working_models_pkey', ['id'], { unique: true })
@Entity('applicant_working_models', { schema: 'public' })
export class ApplicantWorkingModel extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantSkills)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;
}
