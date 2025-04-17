import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnGenderInApplicantTable1742440258333
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants add gender varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants drop column gender');
  }
}
