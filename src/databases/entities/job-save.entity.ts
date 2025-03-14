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

@Index('job_saves_pkey', ['id'], { unique: true })
@Entity('job_saves', { schema: 'public' })
export class JobSave extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'job_id', nullable: true, unique: true })
  jobId: number | null;

  @ManyToOne(() => Job, (jobs) => jobs.jobSaves)
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'id' }])
  job: Job;

  @ManyToOne(() => User, (users) => users.jobSaves)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
