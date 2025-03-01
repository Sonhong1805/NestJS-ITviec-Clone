import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnAvatarInApplicantsTable1740659641429
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants add avatar varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table applicants drop column avatar');
  }
}
