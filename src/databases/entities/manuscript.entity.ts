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
import { ManuscriptSave } from './manuscript-save.entity';
import { ManuscriptSkill } from './manuscript-skill.entity';
import { ManuscriptView } from './manuscript-view.entity';
import { Company } from './company.entity';
import { BaseEntity } from './base.entity';

@Index('manuscripts_pkey', ['id'], { unique: true })
@Entity('manuscripts', { schema: 'public' })
export class Manuscript extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'summary', nullable: true })
  summary: string | null;

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

  @OneToMany(() => Application, (applications) => applications.manuscript)
  applications: Application[];

  @OneToMany(
    () => ManuscriptSave,
    (manuscriptSaves) => manuscriptSaves.manuscript,
  )
  manuscriptSaves: ManuscriptSave[];

  @OneToMany(
    () => ManuscriptSkill,
    (manuscriptSkills) => manuscriptSkills.manuscript,
  )
  manuscriptSkills: ManuscriptSkill[];

  @OneToMany(
    () => ManuscriptView,
    (manuscriptViews) => manuscriptViews.manuscript,
  )
  manuscriptViews: ManuscriptView[];

  @ManyToOne(() => Company, (companies) => companies.manuscripts)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;
}
