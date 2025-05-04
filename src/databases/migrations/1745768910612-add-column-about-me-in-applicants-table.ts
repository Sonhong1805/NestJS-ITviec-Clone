import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnAboutMeInApplicantsTable1745768910612
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants add about_me TEXT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants drop column about-me');
  }
}
