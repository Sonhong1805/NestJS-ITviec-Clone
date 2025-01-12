import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicantEducation } from './applicant-education.entity';
import { ApplicantExperience } from './applicant-experience.entity';
import { ApplicantSkill } from './applicant-skill.entity';
import { User } from './user.entity';
import { Application } from './application.entity';
import { BaseEntity } from './base.entity';

@Index('applicants_pkey', ['id'], { unique: true })
@Index('applicants_user_id_key', ['userId'], { unique: true })
@Entity('applicants', { schema: 'public' })
export class Applicant extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('character varying', { name: 'first_name', nullable: true })
  firstName: string | null;

  @Column('character varying', { name: 'last_name', nullable: true })
  lastName: string | null;

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'cv', nullable: true })
  cv: string | null;

  @Column('character varying', { name: 'address', nullable: true })
  address: string | null;

  @Column('character varying', { name: 'sex', nullable: true })
  sex: string | null;

  @Column('character varying', { name: 'website', nullable: true })
  website: string | null;

  @Column('character varying', { name: 'phone_number', nullable: true })
  phoneNumber: string | null;

  @Column('character varying', { name: 'summary', nullable: true })
  summary: string | null;

  @Column('timestamp without time zone', { name: 'dob', nullable: true })
  dob: Date | null;

  @OneToMany(
    () => ApplicantEducation,
    (applicantEducations) => applicantEducations.applicant,
  )
  applicantEducations: ApplicantEducation[];

  @OneToMany(
    () => ApplicantExperience,
    (applicantExperiences) => applicantExperiences.applicant,
  )
  applicantExperiences: ApplicantExperience[];

  @OneToMany(
    () => ApplicantSkill,
    (applicantSkills) => applicantSkills.applicant,
  )
  applicantSkills: ApplicantSkill[];

  @OneToOne(() => User, (users) => users.applicants)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => Application, (applications) => applications.applicant)
  applications: Application[];
}
