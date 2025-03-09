import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnRefreshTokenInUsersTable1741003876755
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users add refresh_token TEXT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table users drop column refresh_token');
  }
}
