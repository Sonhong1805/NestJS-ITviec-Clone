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

  @Column('integer', { name: 'rate', nullable: true })
  rate: number | null;

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'review', nullable: true })
  review: string | null;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'company_id', nullable: true, unique: true })
  companyId: number | null;

  @ManyToOne(() => Company, (companies) => companies.companyReviews)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;

  @ManyToOne(() => User, (users) => users.companyReviews)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
