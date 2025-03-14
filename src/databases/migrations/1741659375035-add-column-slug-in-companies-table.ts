import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnSlugInCompaniesTable1741659375035
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies add slug varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies drop column slug');
  }
}
