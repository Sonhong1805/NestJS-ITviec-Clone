import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Application } from './application.entity';

@Index('application_locations_pkey', ['id'], { unique: true })
@Index('application_locations_application_id_fkey', ['applicationId'])
@Entity('application_locations', { schema: 'public' })
export class ApplicationLocation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'application_id', nullable: true })
  applicationId: number | null;

  @Column('character varying', { name: 'location', nullable: true })
  location: string | null;

  @ManyToOne(
    () => Application,
    (application) => application.applicationLocations,
  )
  @JoinColumn([{ name: 'application_id', referencedColumnName: 'id' }])
  application: Application;
}
