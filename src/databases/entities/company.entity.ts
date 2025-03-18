import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Industry } from './industry.entity';
import { User } from './user.entity';
import { CompanyFollow } from './company-follow.entity';
import { CompanyReview } from './company-review.entity';
import { BaseEntity } from './base.entity';
import { Job } from './job.entity';
import { CompanySkill } from './company-skill.entity';

@Index('companies_pkey', ['id'], { unique: true })
@Index('companies_user_id_key', ['userId'], { unique: true })
@Entity('companies', { schema: 'public' })
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

  @Column('character varying', { name: 'label', nullable: true })
  label: string | null;

  @Column('character varying', { name: 'slug', nullable: true })
  slug: string | null;

  @Column('character varying', { name: 'website', nullable: true })
  website: string | null;

  @Column('text', { name: 'overview', nullable: true })
  overview: string | null;

  @Column('text', { name: 'perks', nullable: true })
  perks: string | null;

  @Column('character varying', { name: 'logo', nullable: true })
  logo: string | null;

  @Column('character varying', { name: 'position', nullable: true })
  position: string | null;

  @Column('character varying', { name: 'location', nullable: true })
  location: string | null;

  @Column('character varying', { name: 'country', nullable: true })
  country: string | null;

  @Column('character varying', { name: 'company_size', nullable: true })
  companySize: string | null;

  @Column('character varying', { name: 'company_type', nullable: true })
  companyType: string | null;

  @Column('character varying', { name: 'working_day', nullable: true })
  workingDay: string | null;

  @Column('character varying', { name: 'overtime_policy', nullable: true })
  overtimePolicy: string | null;

  @Column('integer', { name: 'industry_id', nullable: true, unique: true })
  industryId: number | null;

  @Column('boolean', { name: 'is_active', nullable: true })
  isActive: boolean | null;

  @ManyToOne(() => Industry, (industries) => industries.companies)
  @JoinColumn([{ name: 'industry_id', referencedColumnName: 'id' }])
  industry: Industry;

  @OneToOne(() => User, (users) => users.companies)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => CompanyFollow, (companyFollows) => companyFollows.company)
  companyFollows: CompanyFollow[];

  @OneToMany(() => CompanyReview, (companyReviews) => companyReviews.company)
  companyReviews: CompanyReview[];

  @OneToMany(() => Job, (jobs) => jobs.company)
  jobs: Job[];

  @OneToMany(() => CompanySkill, (companySkills) => companySkills.company)
  companySkills: CompanySkill[];
}
