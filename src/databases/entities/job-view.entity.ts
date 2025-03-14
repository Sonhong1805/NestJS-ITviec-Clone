import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { Job } from './job.entity';

@Index('job_views_pkey', ['id'], { unique: true })
@Entity('job_views', { schema: 'public' })
export class JobView extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'job_id', nullable: true, unique: true })
  jobId: number | null;

  @ManyToOne(() => Job, (jobs) => jobs.jobViews)
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'id' }])
  job: Job;

  @ManyToOne(() => User, (users) => users.jobViews)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
