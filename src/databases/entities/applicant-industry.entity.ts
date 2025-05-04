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
import { Industry } from './industry.entity';

@Index('applicant_industries_pkey', ['id'], { unique: true })
@Entity('applicant_industries', { schema: 'public' })
export class ApplicantIndustry extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ type: 'integer', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'integer', name: 'industry_id' })
  industryId: number;

  @ManyToOne(() => Applicant, (applicants) => applicants.applicantIndustries)
  @JoinColumn([{ name: 'applicant_id', referencedColumnName: 'id' }])
  applicant: Applicant;

  @ManyToOne(() => Industry, (industries) => industries.applicantIndustries)
  @JoinColumn([{ name: 'industry_id', referencedColumnName: 'id' }])
  industry: Industry;
}
