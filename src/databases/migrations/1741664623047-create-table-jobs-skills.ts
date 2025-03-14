import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableJobsSkills1741664623047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE "jobs_skills" (
            "id" SERIAL PRIMARY KEY,
            "skill_id" INTEGER,
            "job_id" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            CONSTRAINT "FK_job_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_job_skills_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE
          );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "jobs_skills";`);
  }
}
