import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Manuscript } from './manuscript.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Index('manuscript_views_pkey', ['id'], { unique: true })
@Entity('manuscript_views', { schema: 'public' })
export class ManuscriptView extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'manuscript_id', nullable: true, unique: true })
  manuscriptId: number | null;

  @ManyToOne(() => Manuscript, (manuscripts) => manuscripts.manuscriptViews)
  @JoinColumn([{ name: 'manuscript_id', referencedColumnName: 'id' }])
  manuscript: Manuscript;

  @ManyToOne(() => User, (users) => users.manuscriptViews)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
