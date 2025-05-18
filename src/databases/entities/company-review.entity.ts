import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Index('company_reviews_pkey', ['id'], { unique: true })
@Entity('company_reviews', { schema: 'public' })
export class CompanyReview extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'company_id', nullable: true, unique: true })
  companyId: number | null;

  @Column('integer', { name: 'rate', nullable: true })
  rate: number | null;

  @Column('character varying', { name: 'summary', nullable: true })
  summary: string | null;

  @Column('character varying', {
    name: 'overtime_policy_satisfaction',
    nullable: true,
  })
  overtimePolicySatisfaction: string | null;

  @Column('text', { name: 'reason', nullable: true })
  reason: string | null;

  @Column('text', { name: 'experiences', nullable: true })
  experiences: string | null;

  @Column('text', { name: 'suggestion', nullable: true })
  suggestion: string | null;

  @Column('integer', { name: 'salary_benefits', nullable: true })
  salaryBenefits: number | null;

  @Column('integer', { name: 'training_learning', nullable: true })
  trainingLearning: number | null;

  @Column('integer', { name: 'management_care', nullable: true })
  managementCare: number | null;

  @Column('integer', { name: 'culture_fun', nullable: true })
  cultureFun: number | null;

  @Column('integer', { name: 'office_workspace', nullable: true })
  officeWorkspace: number | null;

  @Column('integer', { name: 'is_recommend', nullable: true })
  isRecommend: boolean | null;

  @Column('integer', { name: 'status', nullable: true })
  status: string | null;

  @ManyToOne(() => Company, (companies) => companies.companyReviews)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;

  @ManyToOne(() => User, (users) => users.companyReviews)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
