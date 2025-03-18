import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { BaseEntity } from './base.entity';

@Index('industries_pkey', ['id'], { unique: true })
@Entity('industries', { schema: 'public' })
export class Industry extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name_en', nullable: true })
  nameEn: string | null;

  @Column('character varying', { name: 'name_vi', nullable: true })
  nameVi: string | null;

  @OneToMany(() => Company, (companies) => companies.industry)
  companies: Company[];
}
