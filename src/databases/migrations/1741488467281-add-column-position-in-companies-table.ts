import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnPositionInCompaniesTable1741488467281
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies add position varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table companies drop column position');
  }
}
