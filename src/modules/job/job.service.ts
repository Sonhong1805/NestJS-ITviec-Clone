import { convertToSlug } from './../../commons/utils/convertToSlug';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { JobSkillRepository } from 'src/databases/repositories/job-skill.repository';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { ResdisService } from '../redis/redis.service';
import { DataSource } from 'typeorm';
import { JobSaveRepository } from 'src/databases/repositories/job-save.repository';
import { UpsertJobDto } from './dto/upsert-job.dto';
import { User } from 'src/databases/entities/user.entity';
import { Job } from 'src/databases/entities/job.entity';
import { JobSkill } from 'src/databases/entities/job-skill.entity';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { JobQueriesDto } from './dto/job-queries.dto';
import { convertKeySortJob } from 'src/commons/utils/helper';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobSkillRepository: JobSkillRepository,
    private readonly jobViewRepository: JobViewRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly resdisService: ResdisService,
    private readonly dataSource: DataSource,
    private readonly jobSaveRepository: JobSaveRepository,
  ) {}

  async create(body: UpsertJobDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      body.slug = convertToSlug(body.title);
      const newJob = await queryRunner.manager.save(Job, {
        ...body,
        companyId: findCompany.id,
      });

      const { skillIds } = body;
      delete body.skillIds;

      const jobSkills = skillIds.map((skillId) => ({
        jobId: newJob.id,
        skillId,
      }));

      await queryRunner.manager.save(JobSkill, jobSkills);
      await queryRunner.commitTransaction();

      return {
        message: 'Create job successfully',
        result: newJob,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, body: UpsertJobDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const findjob = await this.jobRepository.findOne({
      where: {
        id,
      },
    });

    if (!findjob) {
      throw new HttpException('job not found', HttpStatus.NOT_FOUND);
    }

    if (findCompany.id !== findjob.companyId) {
      throw new HttpException('job forbidden', HttpStatus.FORBIDDEN);
    }

    const { skillIds } = body;
    delete body.skillIds;

    const updatedjob = await this.jobRepository.save({
      ...findjob,
      ...body,
    });

    await this.jobSkillRepository.delete({ jobId: id });

    const jobSkills = skillIds.map((skillId) => ({
      jobId: findjob.id,
      skillId,
    }));

    await this.jobSkillRepository.save(jobSkills);

    return {
      message: 'Update job successfully',
      result: updatedjob,
    };
  }

  async getDetail(id: number, user: User) {
    const findjob = await this.jobRepository.findOne({
      where: {
        id,
      },
    });

    if (!findjob) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    findjob['isUserFavourite'] = false;

    if (user) {
      const findjobSave = await this.jobSaveRepository.findOne({
        where: {
          userId: user.id,
          jobId: id,
        },
      });

      if (findjobSave) {
        findjob['isUserFavourite'] = true;
      }

      const findjobView = await this.jobViewRepository.findOne({
        where: {
          userId: user.id,
          jobId: id,
        },
      });

      if (findjobView) {
        await this.jobViewRepository.save({
          ...findjobView,
          updatedAt: new Date(),
        });
      } else {
        await this.jobViewRepository.save({
          userId: user.id,
          jobId: id,
        });
      }
    }

    return {
      message: 'get job successfully',
      result: findjob,
    };
  }

  async getAllByViewed(queries: CommonQueryDto, user: User) {
    const { page, limit } = queries;
    const skip = (page - 1) * limit;
    const [data, total] = await this.jobRepository.findAndCount({
      where: {
        jobViews: {
          userId: user.id,
        },
      },
      skip,
      take: limit,
      order: {
        jobViews: {
          updatedAt: 'DESC',
        },
      },
    });

    return {
      message: 'get recent jobs successfully',
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

  async getAll(queries: JobQueriesDto) {
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

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'c')
      .leftJoin('job.jobSkills', 'm')
      .leftJoin('m.skill', 's')
      .select([
        'job.id AS "id"',
        'job.title AS "title"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.summary AS "summary"',
        'job.level AS "level"',
        'job.workingModel AS "workingModel"',
        'job.createdAt AS "createdAt"',
        'c.id AS "companyId"',
        'c.name AS "companyName"',
        'c.location AS "companyAddress"',
        'c.companySize AS "companySize"',
        'c.companyType AS "companyType"',
        'c.industry AS "companyIndustry"',
        'c.logo AS "companyLogo"',
        "JSON_AGG(json_build_object('id',s.id,'name', s.name)) AS jobSkills",
      ])
      .groupBy('job.id, c.id');

    if (keyword) {
      queryBuilder
        .andWhere('s.name ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('job.title ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('job.summary ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('c.name ILIKE :keyword', {
          keyword: `%${keyword}%`,
        });
    }

    if (sort) {
      const order = convertKeySortJob(sort);

      for (const key of Object.keys(order)) {
        queryBuilder.addOrderBy(key, order[key]);
      }
    } else {
      queryBuilder.addOrderBy('job.createdAt', 'DESC');
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
      queryBuilder.andWhere('job.level IN (:...levels)', {
        levels,
      });
    }
    if (workingModels) {
      queryBuilder.andWhere('job.workingModel IN (:...workingModels)', {
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
        .andWhere('job.minSalary >= :minSalary', {
          minSalary,
        })
        .andWhere('job.maxSalary <= :maxSalary', {
          maxSalary,
        });
    }

    queryBuilder.limit(limit).offset(skip);

    const data = await queryBuilder.getRawMany();
    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      message: 'get all job',
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

    const findjob = await this.jobRepository.findOneBy({ id });

    if (findCompany.id !== findjob.companyId) {
      throw new HttpException('User forbidden', HttpStatus.FORBIDDEN);
    }

    await this.jobRepository.softDelete(id);

    await this.resdisService.setKey('manu' + id, '');

    return {
      message: 'Delete job successfully',
    };
  }

  async favorite(id: number, user: User) {
    const jobSave = await this.jobSaveRepository.findOneBy({
      jobId: id,
      userId: user.id,
    });

    if (jobSave) {
      await this.jobSaveRepository.delete({
        jobId: id,
        userId: user.id,
      });
    } else {
      await this.jobSaveRepository.save({
        jobId: id,
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
    const [data, total] = await this.jobRepository.findAndCount({
      where: {
        jobSaves: {
          userId: user.id,
        },
      },
      skip,
      take: limit,
      relations: ['jobSaves'],
      order: {
        jobSaves: {
          createdAt: 'DESC',
        },
      },
    });

    return {
      message: 'get all fa jobs successfully',
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
