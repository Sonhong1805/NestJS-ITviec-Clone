import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const ormConfig: DataSourceOptions = {
  name: 'default',
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/databases/entities/*{.ts,.js}'],
  logging: true,
  logger: 'file',
  migrationsTableName: 'migration_tables',
  synchronize: false,
  migrations: [__dirname + '/databases/migrations/*.ts'],
  migrationsRun: false,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DATABASE_SSL_CA,
  },
};

export const dataSource = new DataSource(ormConfig);
