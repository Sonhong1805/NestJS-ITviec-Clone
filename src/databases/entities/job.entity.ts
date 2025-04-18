import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { Company } from './company.entity';
import { BaseEntity } from './base.entity';
import { JobSkill } from './job-skill.entity';
import { JobView } from './job-view.entity';
import { Wishlist } from './wishlist.entity';

@Index('jobs_pkey', ['id'], { unique: true })
@Entity('jobs', { schema: 'public' })
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'slug', nullable: true })
  slug: string | null;

  @Column('character varying', { name: 'descriptions', nullable: true })
  descriptions: string | null;

  @Column('character varying', { name: 'requirement', nullable: true })
  requirement: string | null;

  @Column('integer', { name: 'quantity', nullable: true })
  quantity: number | null;

  @Column('character varying', { name: 'status', nullable: true })
  status: string | null;

  @Column('character varying', { name: 'location', nullable: true })
  location: string | null;

  @Column('character varying', { name: 'level', nullable: true })
  level: string | null;

  @Column('character varying', { name: 'working_model', nullable: true })
  workingModel: string | null;

  @Column('integer', { name: 'min_salary', nullable: true })
  minSalary: number | null;

  @Column('integer', { name: 'max_salary', nullable: true })
  maxSalary: number | null;

  @Column('character varying', { name: 'currency_salary', nullable: true })
  currencySalary: string | null;

  @Column('timestamp without time zone', { name: 'start_date', nullable: true })
  startDate: Date | null;

  @Column('timestamp without time zone', { name: 'end_date', nullable: true })
  endDate: Date | null;

  @Column('integer', { name: 'count_view', nullable: true })
  countView: number | null;

  @Column('integer', { name: 'company_id', nullable: true, unique: true })
  companyId: number | null;

  @OneToMany(() => Application, (applications) => applications.job)
  applications: Application[];

  @OneToMany(() => Wishlist, (wishlists) => wishlists.job)
  wishlists: Wishlist[];

  @OneToMany(() => JobSkill, (jobSkills) => jobSkills.job)
  jobSkills: JobSkill[];

  @OneToMany(() => JobView, (jobViews) => jobViews.job)
  jobViews: JobView[];

  @ManyToOne(() => Company, (companies) => companies.jobs)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;
}
