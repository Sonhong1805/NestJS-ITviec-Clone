import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicantSkill } from './applicant-skill.entity';
import { ManuscriptSkill } from './manuscript-skill.entity';

@Index('skills_pkey', ['id'], { unique: true })
@Entity('skills', { schema: 'public' })
export class Skill {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', nullable: true })
  name: string | null;

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

  @OneToMany(() => ApplicantSkill, (applicantSkills) => applicantSkills.skill)
  applicantSkills: ApplicantSkill[];

  @OneToMany(
    () => ManuscriptSkill,
    (manuscriptSkills) => manuscriptSkills.skill,
  )
  manuscriptSkills: ManuscriptSkill[];
}
