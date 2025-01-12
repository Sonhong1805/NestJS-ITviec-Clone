import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Index('company_follows_pkey', ['id'], { unique: true })
@Entity('company_follows', { schema: 'public' })
export class CompanyFollow extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('integer', { name: 'company_id', nullable: true, unique: true })
  companyId: number | null;

  @ManyToOne(() => Company, (companies) => companies.companyFollows)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Company;

  @ManyToOne(() => User, (users) => users.companyFollows)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
