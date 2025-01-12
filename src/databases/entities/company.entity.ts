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
import { Manuscript } from './manuscript.entity';
import { BaseEntity } from './base.entity';

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

  @Column('character varying', { name: 'website', nullable: true })
  website: string | null;

  @Column('character varying', { name: 'descriptions', nullable: true })
  descriptions: string | null;

  @Column('character varying', { name: 'logo', nullable: true })
  logo: string | null;

  @Column('character varying', { name: 'code_tax', nullable: true })
  codeTax: string | null;

  @Column('character varying', { name: 'location', nullable: true })
  location: string | null;

  @Column('character varying', { name: 'company_size', nullable: true })
  companySize: string | null;

  @Column('character varying', { name: 'company_type', nullable: true })
  companyType: string | null;

  @Column('character varying', { name: 'working_day', nullable: true })
  workingDay: string | null;

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

  @OneToMany(() => Manuscript, (manuscripts) => manuscripts.company)
  manuscripts: Manuscript[];
}
