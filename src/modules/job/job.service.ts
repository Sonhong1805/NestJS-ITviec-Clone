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
import { StorageService } from '../storage/storage.service';
import { Skill } from 'src/databases/entities/skill.entity';

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
    private readonly storageService: StorageService,
  ) {}

  async create(body: UpsertJobDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newJob = await queryRunner.manager.save(Job, {
        ...body,
        companyId: findCompany.id,
      });

      let slug = convertToSlug(newJob.title);
      const existJob = await queryRunner.manager.findOneBy(Job, { slug });
      if (existJob) {
        slug = `${slug}-${newJob.id}`;
      }

      const updatedSlug = await queryRunner.manager.save(Job, {
        ...newJob,
        slug,
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
        result: updatedSlug,
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

    const findJob = await this.jobRepository.findOne({
      where: {
        id,
      },
    });

    if (!findJob) {
      throw new HttpException('job not found', HttpStatus.NOT_FOUND);
    }

    if (findCompany.id !== findJob.companyId) {
      throw new HttpException('job forbidden', HttpStatus.FORBIDDEN);
    }

    let slug = findJob.slug;
    if (findJob.title !== body.title) {
      slug = convertToSlug(body.title);
      const existJob = await this.jobRepository.findOneBy({ slug });
      if (existJob) {
        slug = `${slug}-${findJob.id}`;
      }
    }

    console.log(slug);

    body.slug = slug;

    const { skillIds } = body;
    delete body.skillIds;

    const updatedjob = await this.jobRepository.save({
      ...findJob,
      ...body,
    });

    await this.jobSkillRepository.delete({ jobId: id });

    const jobSkills = skillIds.map((skillId) => ({
      jobId: findJob.id,
      skillId,
    }));

    await this.jobSkillRepository.save(jobSkills);

    return {
      message: 'update job successfully',
      result: updatedjob,
    };
  }

  async getDetail(slug: string, user: User) {
    const queryBuilder = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company')
      .leftJoin('job.jobSkills', 'jobSkill')
      .leftJoin('jobSkill.skill', 'skill')
      .leftJoin('company.industry', 'industry')
      .select([
        'job.id AS "id"',
        'job.title AS "title"',
        'job.slug AS "slug"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.currencySalary AS "currencySalary"',
        'job.level AS "level"',
        'job.location AS "location"',
        'job.workingModel AS "workingModel"',
        'job.descriptions AS "descriptions"',
        'job.requirement AS "requirement"',
        'job.startDate AS "startDate"',
        'job.endDate AS "endDate"',
        'job.countView AS "countView"',
        'job.quantity AS "quantity"',
        'job.createdAt AS "createdAt"',
        'job.updatedAt AS "updatedAt"',
        'job.deletedAt AS "deletedAt"',
        'job.status AS "status"',
        `json_build_object(
          'id', company.id,
          'name', company.name,
          'slug', company.slug,
          'location', company.location,
          'companyType', company.companyType,
          'overtimePolicy', company.overtimePolicy,
          'companySize', company.companySize,
          'workingDay', company.workingDay,
          'website', company.website,
          'country', company.country,
          'logo', company.logo,
          'industry', json_build_object(
            'id', industry.id,
            'name_en', industry.name_en,
            'name_vi', industry.name_vi
          )
        ) AS company`,
        "JSON_AGG(json_build_object('id', skill.id, 'name', skill.name)) AS skills",
      ])
      .where('job.slug = :slug', { slug })
      .groupBy('job.id, company.id, industry.id');

    const findJob = await queryBuilder.getRawOne();

    if (!findJob) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    findJob['isUserFavourite'] = false;

    if (user) {
      const findJobSave = await this.jobSaveRepository.findOne({
        where: {
          userId: user.id,
          jobId: findJob.id,
        },
      });

      if (findJobSave) {
        findJob['isUserFavourite'] = true;
      }

      const findJobView = await this.jobViewRepository.findOne({
        where: {
          userId: user.id,
          jobId: findJob.id,
        },
      });

      if (findJobView) {
        await this.jobViewRepository.save({
          ...findJobView,
          updatedAt: new Date(),
        });
      } else {
        await this.jobViewRepository.save({
          userId: user.id,
          jobId: findJob.id,
        });
      }
    }

    if (findJob.company.logo) {
      findJob.company.logo = await this.storageService.getSignedUrl(
        findJob.company.logo,
      );
    }

    findJob.skills = findJob.skills.filter((skill: Skill) => skill.id !== null);

    return {
      message: 'get job successfully',
      result: findJob,
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
      city,
      companyTypes,
      levels,
      industryIds,
      minSalary,
      maxSalary,
      workingModels,
      sort,
      industries,
    } = queries;
    console.log(queries);

    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company')
      .leftJoin('job.jobSkills', 'jobSkill')
      .leftJoin('jobSkill.skill', 'skill')
      .leftJoin('company.industry', 'industry')
      .select([
        'job.id AS "id"',
        'job.title AS "title"',
        'job.slug AS "slug"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.currencySalary AS "currencySalary"',
        'job.level AS "level"',
        'job.location AS "location"',
        'job.workingModel AS "workingModel"',
        'job.descriptions AS "descriptions"',
        'job.requirement AS "requirement"',
        'job.startDate AS "startDate"',
        'job.endDate AS "endDate"',
        'job.countView AS "countView"',
        'job.quantity AS "quantity"',
        'job.createdAt AS "createdAt"',
        'job.updatedAt AS "updatedAt"',
        'job.deletedAt AS "deletedAt"',
        'job.status AS "status"',
        `json_build_object(
          'id', company.id,
          'slug', company.slug,
          'location', company.location,
          'workingDay', company.workingDay,
          'companyType', company.companyType,
          'overtimePolicy', company.overtimePolicy,
          'companySize', company.companySize,
          'companyName', company.name,
          'website', company.website,
          'country', company.country,
          'logo', company.logo,
          'industry', json_build_object(
            'id', industry.id,
            'name_en', industry.name_en,
            'name_vi', industry.name_vi
          )
        ) AS company`,
        "JSON_AGG(json_build_object('id', skill.id, 'name', skill.name)) AS skills",
      ])
      .groupBy('job.id, company.id, industry.id');

    if (keyword) {
      queryBuilder
        .andWhere(
          `EXISTS (
          SELECT 1 FROM job_skills
          JOIN skills ON job_skills.skill_id = skills.id
          WHERE job_skills.job_id = job.id
          AND skills.name ILIKE :keyword
        )`,
          { keyword: `%${keyword}%` },
        )
        .orWhere('job.title ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('job.slug ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('company.name ILIKE :keyword', {
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

    if (city) {
      queryBuilder.andWhere('job.location = :city', {
        city,
      });
    }
    if (companyTypes) {
      queryBuilder.andWhere('company.companyType IN (:...types)', {
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
      queryBuilder.andWhere('company.industry IN (:...industryIds)', {
        industryIds,
      });
    }
    if (industries) {
      queryBuilder.andWhere(
        '(industry.name_en IN (:...industries) OR industry.name_vi IN (:...industries))',
        { industries },
      );
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
    const newData = await Promise.all(
      data.map(async (item) => {
        const logo = item.company.logo;
        let signedLogo = logo ?? '';
        if (logo) {
          signedLogo = await this.storageService.getSignedUrl(logo);
        }
        const filterSkills = item.skills.filter(
          (skill: Skill) => skill.id !== null,
        );
        return {
          ...item,
          skills: filterSkills,
          company: { ...item.company, logo: signedLogo },
        };
      }),
    );

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      totalPages,
      totalItems,
      page,
      limit,
    };
    return {
      message: 'get all job successfully',
      result: {
        pagination,
        data: newData,
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

  async getQuantity() {
    const quantity = await this.jobRepository.count();

    return {
      message: 'get quantity all job successfully',
      result: quantity,
    };
  }

  async getJobsByCompany(param: string) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company')
      .leftJoin('job.jobSkills', 'jobSkill')
      .leftJoin('jobSkill.skill', 'skill')
      .leftJoin('company.industry', 'industry')
      .select([
        'job.id AS "id"',
        'job.title AS "title"',
        'job.slug AS "slug"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.currencySalary AS "currencySalary"',
        'job.level AS "level"',
        'job.location AS "location"',
        'job.workingModel AS "workingModel"',
        'job.descriptions AS "descriptions"',
        'job.requirement AS "requirement"',
        'job.startDate AS "startDate"',
        'job.endDate AS "endDate"',
        'job.countView AS "countView"',
        'job.quantity AS "quantity"',
        'job.createdAt AS "createdAt"',
        'job.updatedAt AS "updatedAt"',
        'job.deletedAt AS "deletedAt"',
        'job.status AS "status"',
        "JSON_AGG(json_build_object('id', skill.id, 'name', skill.name)) AS skills",
      ])
      .groupBy('job.id, company.id, industry.id');
    if (!isNaN(+param)) {
      queryBuilder.where('company.userId = :userId', { userId: +param });
    } else {
      queryBuilder.where('company.slug = :slug', { slug: param });
    }
    const data = await queryBuilder.getRawMany();

    return {
      message: 'get all job by slug company successfully',
      result: data,
    };
  }
}
