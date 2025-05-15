import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnDeleteCodeInUsersTable1747238301825
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users add delete_code varchar(255)');
    await queryRunner.query(
      'alter table users add delete_code_expires_at TIMESTAMP',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users drop column delete_code');
    await queryRunner.query(
      'alter table users drop column delete_code_expires_at',
    );
  }
}
