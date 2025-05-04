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
import { ApplicantLocation } from './applicant-location.entity';
import { ApplicantWorkingModel } from './applicant-working-model';
import { ApplicantIndustry } from './applicant-industry.entity';
import { ApplicantProject } from './applicant-project.entity';
import { ApplicantCertificate } from './applicant-certificate.entity';
import { ApplicantAward } from './applicant-award.entity';

@Index('applicants_pkey', ['id'], { unique: true })
@Index('applicants_user_id_fkey', ['userId'], { unique: true })
@Entity('applicants', { schema: 'public' })
export class Applicant extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('character varying', { name: 'title', nullable: true })
  title: string | null;

  @Column('character varying', { name: 'cv', nullable: true })
  cv: string | null;

  @Column('character varying', { name: 'address', nullable: true })
  address: string | null;

  @Column('character varying', { name: 'city', nullable: true })
  city: string | null;

  @Column('character varying', { name: 'gender', nullable: true })
  gender: string | null;

  @Column('character varying', { name: 'link', nullable: true })
  link: string | null;

  @Column('timestamp without time zone', { name: 'dob', nullable: true })
  dob: Date | null;

  @Column('character varying', { name: 'avatar', nullable: true })
  avatar: string | null;

  @Column('text', { name: 'cover_letter', nullable: true })
  coverLetter: string | null;

  @Column('character varying', { name: 'total_years', nullable: true })
  totalYears: string | null;

  @Column('character varying', { name: 'current_level', nullable: true })
  currentLevel: string | null;

  @Column('character varying', {
    name: 'expected_salary_currency',
    nullable: true,
  })
  expectedSalaryCurrency: string | null;

  @Column('character varying', {
    name: 'current_salary_currency',
    nullable: true,
  })
  currentSalaryCurrency: string | null;

  @Column('integer', { name: 'salary_from', nullable: true })
  salaryFrom: number | null;

  @Column('integer', { name: 'salary_to', nullable: true })
  salaryTo: number | null;

  @Column('integer', { name: 'current_salary', nullable: true })
  currentSalary: number | null;

  @Column('text', { name: 'about_me', nullable: true })
  aboutMe: string | null;

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

  @OneToMany(
    () => ApplicantProject,
    (applicantProjects) => applicantProjects.applicant,
  )
  applicantProjects: ApplicantProject[];

  @OneToMany(
    () => ApplicantIndustry,
    (applicantIndustries) => applicantIndustries.applicant,
  )
  applicantIndustries: ApplicantIndustry[];

  @OneToOne(() => User, (users) => users.applicants)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => Application, (applications) => applications.applicant)
  applications: Application[];

  @OneToMany(
    () => ApplicantLocation,
    (ApplicantLocation) => ApplicantLocation.applicant,
  )
  applicantLocations: ApplicantLocation[];

  @OneToMany(
    () => ApplicantWorkingModel,
    (ApplicantWorkingModel) => ApplicantWorkingModel.applicant,
  )
  applicantWorkingModels: ApplicantWorkingModel[];

  @OneToMany(
    () => ApplicantCertificate,
    (ApplicantCertificate) => ApplicantCertificate.applicant,
  )
  applicantCertificates: ApplicantCertificate[];

  @OneToMany(() => ApplicantAward, (ApplicantAward) => ApplicantAward.applicant)
  applicantAwards: ApplicantAward[];
}
