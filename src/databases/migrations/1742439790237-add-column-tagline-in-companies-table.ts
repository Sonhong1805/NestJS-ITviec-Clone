import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnTaglineInCompaniesTable1742439790237
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies add tagline varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies drop column tagline');
  }
}
