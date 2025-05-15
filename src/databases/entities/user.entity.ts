import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Applicant } from './applicant.entity';
import { Company } from './company.entity';
import { CompanyFollow } from './company-follow.entity';
import { CompanyReview } from './company-review.entity';
import { JobView } from './job-view.entity';
import { Wishlist } from './wishlist.entity';
import { BaseEntity } from './base.entity';

@Index('users_pkey', ['id'], { unique: true })
@Entity('users', { schema: 'public' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'username', nullable: true })
  username: string | null;

  @Column('character varying', { name: 'email', nullable: true, unique: true })
  email: string | null;

  @Column('character varying', {
    name: 'phone_number',
    nullable: true,
    unique: true,
  })
  phoneNumber: string | null;

  @Column('character varying', { name: 'login_type', nullable: true })
  loginType: string | null;

  @Column('character varying', { name: 'password', nullable: true })
  password: string | null;

  @Column('character varying', { name: 'role', nullable: true })
  role: string | null;

  @Column('text', { name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @Column('character varying', { name: 'delete_code', nullable: true })
  deleteCode: string | null;

  @Column('timestamp without time zone', {
    name: 'delete_code_expires_at',
    nullable: true,
  })
  deleteCodeExpiresAt: Date | null;

  @OneToOne(() => Applicant, (applicants) => applicants.user)
  applicants: Applicant;

  @OneToOne(() => Company, (companies) => companies.user)
  companies: Company;

  @OneToMany(() => CompanyFollow, (companyFollows) => companyFollows.user)
  companyFollows: CompanyFollow[];

  @OneToMany(() => CompanyReview, (companyReviews) => companyReviews.user)
  companyReviews: CompanyReview[];

  @OneToMany(() => Wishlist, (wishlists) => wishlists.user)
  wishlists: Wishlist[];

  @OneToMany(() => JobView, (jobViews) => jobViews.user)
  jobViews: JobView[];
}
