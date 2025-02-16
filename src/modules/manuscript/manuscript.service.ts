import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { User } from 'src/databases/entities/user.entity';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { DataSource } from 'typeorm';
import { UpsertManuscriptDto } from './dto/upsert-manuscript.dto';

@Injectable()
export class ManuscriptService {
  constructor(
    private readonly manuscriptRepository: ManuscriptRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(body: UpsertManuscriptDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findManuscript = await queryRunner.manager.save(Manuscript, {
        ...body,
        companyId: findCompany.id,
      });

      const { skillIds } = body;
      delete body.skillIds;

      const manuscriptSkills = skillIds.map((skillId) => ({
        manuscriptId: findManuscript.id,
        skillId,
      }));

      await queryRunner.manager.save(ManuscriptSkill, manuscriptSkills);
      await queryRunner.commitTransaction();

      return {
        message: 'Create manuscript successfully',
        result: findManuscript,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, body: UpsertManuscriptDto, user: User) {
    return {
      message: 'Update manuscript successfully',
      result: '',
    };
  }

  async getDetail(id: number) {}

  async getAll(queries: any) {}

  async delete(id: number, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const findManuscript = await this.manuscriptRepository.findOneBy({ id });

    if (findCompany.id !== findManuscript.companyId) {
      throw new HttpException('User forbidden', HttpStatus.FORBIDDEN);
    }

    await this.manuscriptRepository.softDelete(id);

    return {
      message: 'Delete manuscript successfully',
    };
  }
}
