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
import { ManuscriptSave } from './manuscript-save.entity';
import { ManuscriptView } from './manuscript-view.entity';

@Index('users_pkey', ['id'], { unique: true })
@Entity('users', { schema: 'public' })
export class User {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'username', nullable: true })
  username: string | null;

  @Column('character varying', { name: 'email', nullable: true, unique: true })
  email: string | null;

  @Column('character varying', { name: 'login_type', nullable: true })
  loginType: string | null;

  @Column('character varying', { name: 'password', nullable: true })
  password: string | null;

  @Column('character varying', { name: 'role', nullable: true })
  role: string | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp without time zone', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => Applicant, (applicants) => applicants.user)
  applicants: Applicant;

  @OneToOne(() => Company, (companies) => companies.user)
  companies: Company;

  @OneToMany(() => CompanyFollow, (companyFollows) => companyFollows.user)
  companyFollows: CompanyFollow[];

  @OneToMany(() => CompanyReview, (companyReviews) => companyReviews.user)
  companyReviews: CompanyReview[];

  @OneToMany(() => ManuscriptSave, (manuscriptSaves) => manuscriptSaves.user)
  manuscriptSaves: ManuscriptSave[];

  @OneToMany(() => ManuscriptView, (manuscriptViews) => manuscriptViews.user)
  manuscriptViews: ManuscriptView[];
}
