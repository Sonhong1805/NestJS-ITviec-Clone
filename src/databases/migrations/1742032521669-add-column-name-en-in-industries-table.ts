import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNameEnInIndustriesTable1742032521669
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table industries add name_en varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table industries drop column name_en');
  }
}
