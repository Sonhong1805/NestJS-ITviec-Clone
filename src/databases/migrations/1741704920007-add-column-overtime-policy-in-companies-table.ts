import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnOvertimePolicyInCompaniesTable1741704920007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table companies add overtime_policy varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table companies drop column overtime_policy',
    );
  }
}
