import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldInTableCompanyReviews1745036847153
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table company_reviews add overtime_policy_satisfaction varchar(255)',
    );
    await queryRunner.query('alter table company_reviews add reason TEXT');
    await queryRunner.query('alter table company_reviews add experiences TEXT');
    await queryRunner.query('alter table company_reviews add suggestion TEXT');
    await queryRunner.query(
      'alter table company_reviews add salary_benefits integer',
    );
    await queryRunner.query(
      'alter table company_reviews add training_learning integer',
    );
    await queryRunner.query(
      'alter table company_reviews add management_care integer',
    );
    await queryRunner.query(
      'alter table company_reviews add culture_fun integer',
    );
    await queryRunner.query(
      'alter table company_reviews add office_workspace integer',
    );
    await queryRunner.query(
      'alter table company_reviews add is_recommend boolean',
    );
    await queryRunner.query(
      'alter table company_reviews rename column title to summary',
    );
    await queryRunner.query('alter table company_reviews drop column review');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE company_reviews add column review varchar(255)',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews rename column summary TO title',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column office_workspace',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column is_recommend',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column culture_fun',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column management_care',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column training_learning',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column salary_benefits',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column suggestion',
    );
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column experiences',
    );
    await queryRunner.query('ALTER TABLE company_reviews drop column reason');
    await queryRunner.query(
      'ALTER TABLE company_reviews drop column overtime_policy_satisfaction',
    );
  }
}
