import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Manuscript } from './manuscript.entity';
import { Skill } from './skill.entity';
import { BaseEntity } from './base.entity';

@Index('manuscript_skills_pkey', ['id'], { unique: true })
@Entity('manuscript_skills', { schema: 'public' })
export class ManuscriptSkill extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'skill_id', nullable: true, unique: true })
  skillId: number | null;

  @Column('integer', { name: 'manuscript_id', nullable: true, unique: true })
  manuscriptId: number | null;

  @ManyToOne(() => Manuscript, (manuscripts) => manuscripts.manuscriptSkills)
  @JoinColumn([{ name: 'manuscript_id', referencedColumnName: 'id' }])
  manuscript: Manuscript;

  @ManyToOne(() => Skill, (skills) => skills.manuscriptSkills)
  @JoinColumn([{ name: 'skill_id', referencedColumnName: 'id' }])
  skill: Skill;
}
