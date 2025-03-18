import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnLabelInCompaniesTable1741935956489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies add label varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies drop column label');
  }
}
