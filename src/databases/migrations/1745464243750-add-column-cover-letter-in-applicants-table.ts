import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnCoverLetterInApplicantsTable1745464243750
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants add cover_letter TEXT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants drop column cover_letter');
  }
}
