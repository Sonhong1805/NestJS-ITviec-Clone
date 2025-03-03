import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { User } from 'src/databases/entities/user.entity';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { DataSource } from 'typeorm';
import { UpsertManuscriptDto } from './dto/upsert-manuscript.dto';
import { ManuscriptQueriesDto } from './dto/manuscript-queries.dto';
import { convertKeySortManuscript } from 'src/commons/utils/helper';
import { ManuscriptSkillRepository } from 'src/databases/repositories/manuscript-skill.repository';
import { ResdisService } from '../redis/redis.service';
import { ManuscriptViewRepository } from 'src/databases/repositories/manuscript-view.repository';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { ManuscriptSaveRepository } from 'src/databases/repositories/manuscript-save.repository';

@Injectable()
export class ManuscriptService {
  constructor(
    private readonly manuscriptRepository: ManuscriptRepository,
    private readonly manuscriptSkillRepository: ManuscriptSkillRepository,
    private readonly manuscriptViewRepository: ManuscriptViewRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly resdisService: ResdisService,
    private readonly dataSource: DataSource,
    private readonly manuscriptSaveRepository: ManuscriptSaveRepository,
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
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const findManuscript = await this.manuscriptRepository.findOne({
      where: {
        id,
      },
    });

    if (!findManuscript) {
      throw new HttpException('Manuscript not found', HttpStatus.NOT_FOUND);
    }

    if (findCompany.id !== findManuscript.companyId) {
      throw new HttpException('Manuscript forbidden', HttpStatus.FORBIDDEN);
    }

    const { skillIds } = body;
    delete body.skillIds;

    const updatedManuscript = await this.manuscriptRepository.save({
      ...findManuscript,
      ...body,
    });

    await this.manuscriptSkillRepository.delete({ manuscriptId: id });

    const manuscriptSkills = skillIds.map((skillId) => ({
      manuscriptId: findManuscript.id,
      skillId,
    }));

    await this.manuscriptSkillRepository.save(manuscriptSkills);

    return {
      message: 'Update manuscript successfully',
      result: updatedManuscript,
    };
  }

  async getDetail(id: number, user: User) {
    const findManuscript = await this.manuscriptRepository.findOne({
      where: {
        id,
      },
    });

    if (!findManuscript) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    findManuscript['isUserFavourite'] = false;

    if (user) {
      const findManuscriptSave = await this.manuscriptSaveRepository.findOne({
        where: {
          userId: user.id,
          manuscriptId: id,
        },
      });

      if (findManuscriptSave) {
        findManuscript['isUserFavourite'] = true;
      }

      const findManuscriptView = await this.manuscriptViewRepository.findOne({
        where: {
          userId: user.id,
          manuscriptId: id,
        },
      });

      if (findManuscriptView) {
        await this.manuscriptViewRepository.save({
          ...findManuscriptView,
          updatedAt: new Date(),
        });
      } else {
        await this.manuscriptViewRepository.save({
          userId: user.id,
          manuscriptId: id,
        });
      }
    }

    return {
      message: 'get manuscript successfully',
      result: findManuscript,
    };
  }

  async getAllByViewed(queries: CommonQueryDto, user: User) {
    const { page, limit } = queries;
    const skip = (page - 1) * limit;
    const [data, total] = await this.manuscriptRepository.findAndCount({
      where: {
        manuscriptViews: {
          userId: user.id,
        },
      },
      skip,
      take: limit,
      order: {
        manuscriptViews: {
          updatedAt: 'DESC',
        },
      },
    });

    return {
      message: 'get recent manuscripts successfully',
      result: {
        data,
        metadata: {
          total,
          page,
          limit,
        },
      },
    };
  }

  async getAll(queries: ManuscriptQueriesDto) {
    const {
      page,
      limit,
      keyword,
      companyAddress,
      companyTypes,
      levels,
      industryIds,
      minSalary,
      maxSalary,
      workingModels,
      sort,
    } = queries;

    const skip = (page - 1) * limit;

    const queryBuilder = this.manuscriptRepository
      .createQueryBuilder('manuscript')
      .leftJoin('manuscript.company', 'c')
      .leftJoin('manuscript.manuscriptSkills', 'm')
      .leftJoin('m.skill', 's')
      .select([
        'manuscript.id AS "id"',
        'manuscript.title AS "title"',
        'manuscript.minSalary AS "minSalary"',
        'manuscript.maxSalary AS "maxSalary"',
        'manuscript.summary AS "summary"',
        'manuscript.level AS "level"',
        'manuscript.workingModel AS "workingModel"',
        'manuscript.createdAt AS "createdAt"',
        'c.id AS "companyId"',
        'c.name AS "companyName"',
        'c.location AS "companyAddress"',
        'c.companySize AS "companySize"',
        'c.companyType AS "companyType"',
        'c.industry AS "companyIndustry"',
        'c.logo AS "companyLogo"',
        "JSON_AGG(json_build_object('id',s.id,'name', s.name)) AS manuscriptSkills",
      ])
      .groupBy('manuscript.id, c.id');

    if (keyword) {
      queryBuilder
        .andWhere('s.name ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('manuscript.title ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('manuscript.summary ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('c.name ILIKE :keyword', {
          keyword: `%${keyword}%`,
        });
    }

    if (sort) {
      const order = convertKeySortManuscript(sort);

      for (const key of Object.keys(order)) {
        queryBuilder.addOrderBy(key, order[key]);
      }
    } else {
      queryBuilder.addOrderBy('manuscript.createdAt', 'DESC');
    }

    if (companyAddress) {
      queryBuilder.andWhere('c.location = :address', {
        address: companyAddress,
      });
    }
    if (companyTypes) {
      queryBuilder.andWhere('c.companyType IN (:...types)', {
        types: companyTypes,
      });
    }
    if (levels) {
      queryBuilder.andWhere('manuscript.level IN (:...levels)', {
        levels,
      });
    }
    if (workingModels) {
      queryBuilder.andWhere('manuscript.workingModel IN (:...workingModels)', {
        workingModels,
      });
    }
    if (industryIds) {
      queryBuilder.andWhere('c.industry IN (:...industryIds)', {
        industryIds,
      });
    }

    if (minSalary && maxSalary) {
      queryBuilder
        .andWhere('manuscript.minSalary >= :minSalary', {
          minSalary,
        })
        .andWhere('manuscript.maxSalary <= :maxSalary', {
          maxSalary,
        });
    }

    queryBuilder.limit(limit).offset(skip);

    const data = await queryBuilder.getRawMany();
    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      message: 'get all manuscript',
      result: {
        totalPages,
        totalItems,
        page,
        limit,
        data,
      },
    };
  }

  async delete(id: number, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const findManuscript = await this.manuscriptRepository.findOneBy({ id });

    if (findCompany.id !== findManuscript.companyId) {
      throw new HttpException('User forbidden', HttpStatus.FORBIDDEN);
    }

    await this.manuscriptRepository.softDelete(id);

    await this.resdisService.setKey('manu' + id, '');

    return {
      message: 'Delete manuscript successfully',
    };
  }

  async favorite(id: number, user: User) {
    const manuscriptSave = await this.manuscriptSaveRepository.findOneBy({
      manuscriptId: id,
      userId: user.id,
    });

    if (manuscriptSave) {
      await this.manuscriptSaveRepository.delete({
        manuscriptId: id,
        userId: user.id,
      });
    } else {
      await this.manuscriptSaveRepository.save({
        manuscriptId: id,
        userId: user.id,
      });
    }

    return {
      message: '',
    };
  }

  async getAllByFavorite(queries: CommonQueryDto, user: User) {
    const { page, limit } = queries;
    const skip = (page - 1) * limit;
    const [data, total] = await this.manuscriptRepository.findAndCount({
      where: {
        manuscriptSaves: {
          userId: user.id,
        },
      },
      skip,
      take: limit,
      relations: ['manuscriptSaves'],
      order: {
        manuscriptSaves: {
          createdAt: 'DESC',
        },
      },
    });

    return {
      message: 'get all fa manuscripts successfully',
      result: {
        data,
        metadata: {
          total,
          page,
          limit,
        },
      },
    };
  }
}
