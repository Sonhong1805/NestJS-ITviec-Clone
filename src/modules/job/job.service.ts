import { convertToSlug } from './../../commons/utils/convertToSlug';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { JobSkillRepository } from 'src/databases/repositories/job-skill.repository';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { ResdisService } from '../redis/redis.service';
import { DataSource, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UpsertJobDto } from './dto/upsert-job.dto';
import { User } from 'src/databases/entities/user.entity';
import { Job } from 'src/databases/entities/job.entity';
import { JobSkill } from 'src/databases/entities/job-skill.entity';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { JobQueriesDto } from './dto/job-queries.dto';
import { convertKeySortJob } from 'src/commons/utils/helper';
import { StorageService } from '../storage/storage.service';
import { Skill } from 'src/databases/entities/skill.entity';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { WishlistRepository } from 'src/databases/repositories/wishlist.repository';
import { SkillRepository } from 'src/databases/repositories/skill.repository';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobSkillRepository: JobSkillRepository,
    private readonly jobViewRepository: JobViewRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly resdisService: ResdisService,
    private readonly dataSource: DataSource,
    private readonly wishlistRepository: WishlistRepository,
    private readonly storageService: StorageService,
    private readonly applicationRepository: ApplicationRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly skillRepository: SkillRepository,
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

      const skills = await queryRunner.manager.find(Skill, {
        where: {
          id: In(skillIds),
        },
      });
      await queryRunner.commitTransaction();

      const orderedSkills = skillIds
        .map((id) => skills.find((skill) => skill.id === id))
        .filter(Boolean);

      return {
        message: 'Created job successfully',
        result: { ...updatedSlug, skills: orderedSkills },
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

    const skills = await this.skillRepository.find({
      where: {
        id: In(skillIds),
      },
      select: { id: true, name: true },
    });
    const orderedSkills = skillIds
      .map((id) => skills.find((skill) => skill.id === id))
      .filter(Boolean);
    return {
      message: 'Updated job successfully',
      result: { ...updatedjob, skills: orderedSkills },
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
        'job.label AS "label"',
        'job.slug AS "slug"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.currencySalary AS "currencySalary"',
        'job.level AS "level"',
        'job.location AS "location"',
        'job.workingModel AS "workingModel"',
        'job.description AS "description"',
        'job.requirement AS "requirement"',
        'job.address AS "address"',
        'job.reason AS "reason"',
        'job.startDate AS "startDate"',
        'job.endDate AS "endDate"',
        'job.createdAt AS "createdAt"',
        'job.updatedAt AS "updatedAt"',
        'job.deletedAt AS "deletedAt"',
        `json_build_object(
          'id', company.id,
          'companyName', company.name,
          'tagline', company.tagline,
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

    findJob['wishlist'] = false;

    if (user) {
      const findWishlist = await this.wishlistRepository.findOne({
        where: {
          userId: user.id,
          jobId: findJob.id,
        },
      });

      if (findWishlist) {
        findJob['wishlist'] = true;
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

      const applicant = await this.applicantRepository.findOne({
        where: { userId: user.id },
      });

      const application = await this.applicationRepository.findOne({
        where: {
          applicantId: applicant.id,
          jobId: findJob.id,
        },
      });
      if (application) {
        findJob.hasApplied = application;
      }

      const findApplication = await this.applicationRepository.findOne({
        where: {
          applicantId: applicant.id,
        },
      });
      if (findApplication) {
        findJob.uploadAt = findApplication.createdAt;
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

  async getAll(queries: JobQueriesDto, user: User) {
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
        'job.label AS "label"',
        'job.slug AS "slug"',
        'job.minSalary AS "minSalary"',
        'job.maxSalary AS "maxSalary"',
        'job.currencySalary AS "currencySalary"',
        'job.level AS "level"',
        'job.location AS "location"',
        'job.workingModel AS "workingModel"',
        'job.description AS "description"',
        'job.requirement AS "requirement"',
        'job.address AS "address"',
        'job.reason AS "reason"',
        'job.startDate AS "startDate"',
        'job.endDate AS "endDate"',
        'job.createdAt AS "createdAt"',
        'job.updatedAt AS "updatedAt"',
        'job.deletedAt AS "deletedAt"',
        `json_build_object(
          'id', company.id,
          'slug', company.slug,
          'tagline', company.tagline,
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
      .where('job.startDate <= :now', { now: new Date() })
      .andWhere('job.endDate >= :now', { now: new Date() })
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

    let newData = await Promise.all(
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

    let applicationsMap = new Map<number, any>();
    if (user) {
      const applicant = await this.applicantRepository.findOne({
        where: { userId: user.id },
      });

      if (applicant) {
        const jobIds = newData.map((item) => item.id);

        const applications = await this.applicationRepository.find({
          where: {
            applicantId: applicant.id,
            jobId: In(jobIds),
          },
        });

        applicationsMap = new Map(applications.map((app) => [app.jobId, app]));
        const wishlists = await this.wishlistRepository.find({
          where: {
            userId: user.id,
            jobId: In(jobIds),
          },
        });
        const wishlistIds = wishlists.map((item) => item.jobId);

        newData = newData.map((item) => ({
          ...item,
          wishlist: wishlistIds.includes(item.id),
          hasApplied: applicationsMap.get(item.id) ?? null,
        }));
      }
    }

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

    const deletedJob = await this.jobRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    return {
      message: 'Deleted job successfully',
      result: deletedJob.deletedAt,
    };
  }

  async wishlist(jobId: number, user: User) {
    const wishlist = await this.wishlistRepository.findOneBy({
      jobId,
      userId: user.id,
    });

    if (wishlist) {
      await this.wishlistRepository.delete({
        jobId,
        userId: user.id,
      });
    } else {
      const [, count] = await this.wishlistRepository.findAndCount({
        where: { userId: user.id },
      });
      if (count >= 20) {
        throw new HttpException(
          'You have reached the limit of 20 Saved Jobs. If you want to create a new one, please manage your Saved Jobs.',
          HttpStatus.FORBIDDEN,
        );
      }
      await this.wishlistRepository.save({
        jobId,
        userId: user.id,
      });
    }

    return {
      message: wishlist
        ? 'You unsaved a job.'
        : 'This job has been added to your Saved jobs.',
      result: wishlist ? false : true,
    };
  }

  async getQuantity() {
    const now = new Date();

    const quantity = await this.jobRepository.count({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });

    return {
      message: 'Get quantity of currently active jobs successfully',
      result: quantity,
    };
  }
}
