import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnPhoneNumberInUsersTable1741488026593
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users add phone_number varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users drop column phone_number');
  }
}
