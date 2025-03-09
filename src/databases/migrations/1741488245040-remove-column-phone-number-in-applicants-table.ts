import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColumnPhoneNumberInApplicantsTable1741488245040
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants drop column phone_number');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table applicants add phone_number varchar(255)',
    );
  }
}
