import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';
import { ReviewCompanyDto } from './dto/review-company.dto';
import { CompanyReviewRepository } from 'src/databases/repositories/company-review.repository';
import { CompanyReviewQueryDto } from './dto/company-review-query.dto';
import {
  Brackets,
  DataSource,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { convertToSlug } from 'src/commons/utils/convertToSlug';
import { Company } from 'src/databases/entities/company.entity';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { CompanySkill } from 'src/databases/entities/company-skill.entity';
import { CompanySkillRepository } from 'src/databases/repositories/company-skill.repository';
import { Skill } from 'src/databases/entities/skill.entity';
import { CompanyFollowRepository } from 'src/databases/repositories/company-follow.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { CompanyQueriesDto } from './dto/company-queries.dto';
import {
  convertKeySortApplication,
  convertKeySortJob,
} from 'src/commons/utils/helper';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { AllCVQueriesDto } from './dto/all-cv-queries.dto';
import { AllReviewQueriesDto } from './dto/all-review-queries.dto';
import { ChangeStatusReviewDto } from './dto/change-status-review.dto';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { WishlistRepository } from 'src/databases/repositories/wishlist.repository';
import { AllJobQueriesDto } from './dto/all-job-queries.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly industryRepository: IndustryRepository,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly companyReviewRepository: CompanyReviewRepository,
    private readonly userRepository: UserRepository,
    private readonly companySkillRepository: CompanySkillRepository,
    private readonly companyFollowRepository: CompanyFollowRepository,
    private readonly jobRepository: JobRepository,
    private readonly applicationRepository: ApplicationRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async dashboard(user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    if (!findCompany) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    const now = new Date();

    const [
      totalJobs,
      jobActive,
      jobExpired,
      totalCVs,
      cvAccepted,
      cvPending,
      totalReviews,
      totalFollows,
    ] = await Promise.all([
      this.jobRepository.count({
        where: { companyId: findCompany.id },
      }),
      this.jobRepository.count({
        where: {
          companyId: findCompany.id,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
      }),
      this.jobRepository.count({
        where: {
          companyId: findCompany.id,
          endDate: LessThan(now),
        },
      }),
      this.applicationRepository.count({
        where: {
          job: {
            companyId: findCompany.id,
          },
        },
        relations: { job: true },
      }),
      this.applicationRepository.count({
        where: {
          job: {
            companyId: findCompany.id,
          },
          status: 'accepted',
        },
        relations: { job: true },
      }),
      this.applicationRepository.count({
        where: {
          job: {
            companyId: findCompany.id,
          },
          status: 'pending',
        },
        relations: { job: true },
      }),
      this.companyReviewRepository.count({
        where: { companyId: findCompany.id },
      }),
      this.companyFollowRepository.count({
        where: { companyId: findCompany.id },
      }),
    ]);

    return {
      message: 'get company dashboard successfully',
      result: {
        job: {
          totalJobs,
          jobActive,
          jobExpired,
        },
        cv: {
          totalCVs,
          cvAccepted,
          cvPending,
        },
        review: {
          totalReviews,
        },
        follow: {
          totalFollows,
        },
      },
    };
  }

  async update(
    id: number,
    file: Express.Multer.File,
    body: UpdateCompanyDto,
    user: User,
  ) {
    const {
      username,
      email,
      phoneNumber,
      companyName,
      companySize,
      companyType,
      country,
      industryId,
      location,
      overtimePolicy,
      overview,
      perks,
      website,
      workingDay,
      position,
      skillIds,
      tagline,
    } = body;
    let slug = body.slug;

    const findCompany = await this.companyRepository.findOneBy({
      id,
      userId: user.id,
    });

    let logo = findCompany.logo;
    if (file) {
      const validMineType = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMineType.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid mine type. only images are allowed',
        );
      }

      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new BadRequestException('File size exceeds the 5MB');
      }

      const filePath = `/images/${Date.now()}/${file.originalname}`;
      const uploadResult = await this.storageService.uploadFile(
        filePath,
        file.buffer,
      );
      logo = await uploadResult.path;
    }

    if (!findCompany) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }

    const findIndustry = await this.industryRepository.findOneBy({
      id: body.industryId,
    });

    if (!findIndustry) {
      throw new HttpException('industry not found', HttpStatus.NOT_FOUND);
    }

    if (body.companyName !== findCompany.name) {
      slug = convertToSlug(body.companyName);
    }

    const currentUser = await this.userRepository.findOneBy({
      id: findCompany.userId,
    });

    if (email !== currentUser.email) {
      const findEmail = await this.userRepository.findOneBy({ email });
      if (findEmail) {
        throw new HttpException(
          'Email is already exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.update(
        Company,
        { id, userId: user.id },
        {
          position,
          name: companyName,
          slug,
          logo: logo ? logo : findCompany.logo,
          companySize,
          companyType,
          country,
          industryId,
          location,
          workingDay,
          overtimePolicy,
          overview,
          perks,
          website,
          tagline,
        },
      );

      const updatedCompany = await queryRunner.manager.findOne(Company, {
        where: { id, userId: user.id },
      });

      if (findCompany.logo !== logo) {
        await this.storageService.deleteFile(findCompany.logo);
      }

      if (updatedCompany.logo) {
        updatedCompany.logo = await this.storageService.getSignedUrl(
          updatedCompany.logo,
        );
      }

      delete body.skillIds;

      const companySkills = skillIds.map((skillId) => ({
        companyId: updatedCompany.id,
        skillId,
      }));

      await queryRunner.manager.save(CompanySkill, companySkills);

      await this.companySkillRepository.delete({ companyId: id });

      await queryRunner.manager.update(
        User,
        { id: user.id },
        {
          username,
          email,
          phoneNumber,
        },
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Update company successfully',
        result: { ...updatedCompany, username, email, phoneNumber },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getDetail(param: string | number, user: User) {
    const companyQueryBuilder = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.companySkills', 'companySkill')
      .leftJoin('companySkill.skill', 'skill')
      .leftJoin('company.industry', 'industry')
      .select([
        'company.id as "id"',
        'company.name as "companyName"',
        'company.slug as "slug"',
        'company.tagline as "tagline"',
        'company.website as "website"',
        'company.overview as "overview"',
        'company.perks as "perks"',
        'company.logo as "logo"',
        'company.position as "position"',
        'company.location as "location"',
        'company.country as "country"',
        'company.companySize as "companySize"',
        'company.companyType as "companyType"',
        'company.workingDay as "workingDay"',
        'company.overtimePolicy as "overtimePolicy"',
        `json_build_object(
          'id', industry.id,
          'name_en', industry.name_en,
          'name_vi', industry.name_vi
        ) AS industry`,
        "COALESCE(JSON_AGG(json_build_object('id',skill.id,'name', skill.name)) FILTER (WHERE skill.id IS NOT NULL), '[]')  AS skills",
      ])
      .groupBy('company.id, industry.id');

    if (!isNaN(+param)) {
      companyQueryBuilder.where('company.userId = :userId', { userId: +param });
    } else {
      companyQueryBuilder.where('company.slug = :slug', { slug: param });
    }

    const findCompany = await companyQueryBuilder.getRawOne();

    if (!findCompany) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    if (findCompany.logo) {
      findCompany.logo = await this.storageService.getSignedUrl(
        findCompany.logo,
      );
    }

    const jobQueryBuilder = await this.jobRepository
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
      .where('company.id = :id', { id: findCompany.id })
      .groupBy('job.id, company.id, industry.id')
      .andWhere('job.startDate <= :now', { now: new Date() })
      .andWhere('job.endDate >= :now', { now: new Date() })
      .addOrderBy('job.startDate', 'DESC');

    const findJobs = await jobQueryBuilder.getRawMany();

    let signedJobs = await Promise.all(
      findJobs.map(async (jobItem) => {
        const logoKey = jobItem.company.logo;

        let signedLogoUrl: string | null = null;
        if (logoKey) {
          signedLogoUrl = await this.storageService.getSignedUrl(logoKey);
        }

        jobItem.company = {
          ...(jobItem.company as any),
          logo: signedLogoUrl,
        };

        if (user) {
          jobItem['wishlist'] = false;

          const findWishlist = await this.wishlistRepository.findOne({
            where: {
              userId: user.id,
              jobId: jobItem.id,
            },
          });
          if (findWishlist) {
            jobItem['wishlist'] = true;
          }
        }
        return jobItem;
      }),
    );

    let applicationsMap = new Map<number, any>();

    if (user) {
      const findFollow = await this.companyFollowRepository.findOne({
        where: {
          userId: user.id,
          companyId: findCompany.id,
        },
      });

      findCompany['follow'] = !!findFollow;

      const findReview = await this.companyReviewRepository.findOne({
        where: {
          userId: user.id,
          companyId: findCompany.id,
        },
      });

      findCompany['review'] = !!findReview;

      const findApplicant = await this.applicantRepository.findOne({
        where: { userId: user.id },
      });

      if (findApplicant) {
        const jobIds = signedJobs.map((item) => item.id);

        const applications = await this.applicationRepository.find({
          where: {
            applicantId: findApplicant.id,
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

        signedJobs = signedJobs.map((item) => ({
          ...item,
          wishlist: wishlistIds.includes(item.id),
          hasApplied: applicationsMap.get(item.id) ?? null,
        }));
      }
    }

    findCompany.jobs = signedJobs;

    return {
      message: `Get company by ${!isNaN(+param) ? 'userId' : 'slug'} successfully`,
      result: findCompany,
    };
  }

  async createReview(id: number, body: ReviewCompanyDto, user: User) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }

    const companyReview = await this.companyReviewRepository.save({
      ...body,
      companyId: id,
      userId: user.id,
      status: 'Show',
    });

    return {
      message: 'create review company successfully',
      result: companyReview,
    };
  }

  async getReviews(id: number, queries: CompanyReviewQueryDto) {
    const { limit, cursor } = queries;
    const totalItems = await this.companyReviewRepository.count({
      where: { companyId: id },
    });

    const queryBuilder = await this.companyReviewRepository
      .createQueryBuilder('review')
      .where('review.companyId = :companyId', { companyId: id })
      .orderBy('review.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      queryBuilder.andWhere('review.id < :cursor', { cursor });
    }

    const results = await queryBuilder.getMany();

    const hasNextPage = results.length > limit;
    let next = null;
    if (hasNextPage) {
      results.pop();
      next = results[results.length - 1].id;
    }

    return {
      message: 'get review company successfully',
      result: {
        data: results,
        pagination: {
          limit,
          next,
          totalItems,
        },
      },
    };
  }

  async getAll(queries: CompanyQueriesDto) {
    const { name } = queries;
    const queryBuilder = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.companySkills', 'companySkill')
      .leftJoin('companySkill.skill', 'skill')
      .leftJoin('company.jobs', 'job')
      .select([
        'company.id as "id"',
        'company.name as "companyName"',
        'company.slug as "slug"',
        'company.logo as "logo"',
        'company.location as "location"',
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('id',skill.id,'name', skill.name)
          ) FILTER (WHERE skill.id IS NOT NULL), '[]'
        ) AS "skills"`,
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('id',job.id,'title', job.title)
          ) FILTER (WHERE job.id IS NOT NULL), '[]'
        ) AS "jobs"`,
      ])
      .groupBy('company.id');
    if (name) {
      queryBuilder
        .andWhere('company.name ILIKE :name', {
          name: `%${name}%`,
        })
        .orWhere('company.slug ILIKE :name', {
          name: `%${name}%`,
        });
    }
    const data = await queryBuilder.getRawMany();
    const newData = await Promise.all(
      data.map(async (item) => {
        const logo = item.logo;
        let signedLogo = logo ?? '';
        if (logo) {
          signedLogo = await this.storageService.getSignedUrl(logo);
        }
        const filterSkills = item.skills.filter(
          (skill: Skill) => skill.id !== null,
        );
        return {
          ...item,
          logo: signedLogo,
          skills: filterSkills,
        };
      }),
    );
    return {
      message: 'get all company successfully',
      result: newData,
    };
  }

  async follow(id: number, user: User) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }
    const followed = await this.companyFollowRepository.findOneBy({
      companyId: id,
      userId: user.id,
    });

    if (followed) {
      await this.companyFollowRepository.delete({
        companyId: id,
        userId: user.id,
      });
    } else {
      await this.companyFollowRepository.save({
        companyId: id,
        userId: user.id,
      });
    }

    return {
      message: followed
        ? 'unfollow company successfully'
        : 'follow company successfully',
      result: followed ? false : true,
    };
  }

  async getAllJob(queries: AllJobQueriesDto, user: User) {
    const { page, limit, sort, levels, status, currencies } = queries;

    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });
    if (!findCompany) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .withDeleted()
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
        "JSON_AGG(json_build_object('id', skill.id, 'name', skill.name)) AS skills",
      ])
      .where('job.companyId = :companyId', { companyId: findCompany.id })
      .groupBy('job.id, company.id, industry.id');

    if (status) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (status.includes('deleted')) {
            qb.orWhere('job.deletedAt IS NOT NULL');
          }

          if (status.includes('expired')) {
            qb.orWhere('job.endDate < NOW() AND job.deletedAt IS NULL');
          }

          if (status.includes('active')) {
            qb.orWhere('job.endDate >= NOW() AND job.deletedAt IS NULL');
          }
        }),
      );
    }

    if (sort) {
      const order = convertKeySortJob(sort);

      for (const key of Object.keys(order)) {
        queryBuilder.addOrderBy(key, order[key]);
      }
    } else {
      queryBuilder.addOrderBy('job.createdAt', 'DESC');
    }

    if (levels) {
      queryBuilder.andWhere('job.level IN (:...levels)', {
        levels,
      });
    }

    if (currencies) {
      queryBuilder.andWhere('job.currencySalary IN (:...currencies)', {
        currencies,
      });
    }

    queryBuilder.limit(limit).offset(skip);

    const data = await queryBuilder.getRawMany();

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      totalPages,
      totalItems,
      page,
      limit,
    };
    return {
      message: 'get company jobs successfully',
      result: {
        pagination,
        data,
      },
    };
  }

  async getAllCV(queries: AllCVQueriesDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });
    if (!findCompany) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }

    const { page, limit, sort, status } = queries;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .withDeleted()
      .leftJoin('application.job', 'job')
      .leftJoin('application.applicationLocations', 'location')
      .select([
        'application.id AS "id"',
        'application.fullName AS "fullName"',
        'application.phoneNumber AS "phoneNumber"',
        'application.cv AS "cv"',
        'application.applicantId AS "applicantId"',
        'application.coverLetter AS "coverLetter"',
        'application.status AS "status"',
        'application.createdAt AS "createdAt"',
        'application.updatedAt AS "updatedAt"',
        'application.deletedAt AS "deletedAt"',
        'job.id AS "jobId"',
        'job.title AS "jobTitle"',
        'job.endDate AS "jobEndDate"',
        "JSON_AGG(json_build_object('id', location.id, 'location', location.location)) AS locations",
      ])
      .where('job.companyId = :companyId', { companyId: findCompany.id })
      .groupBy('application.id, job.id');

    if (sort) {
      const order = convertKeySortApplication(sort);
      for (const key of Object.keys(order)) {
        queryBuilder.addOrderBy(`${key}`, order[key]);
      }
    } else {
      queryBuilder.addOrderBy('application.createdAt', 'DESC');
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];

      queryBuilder.andWhere(
        new Brackets((qb) => {
          // Nếu có 'deleted' thì lấy những bản ghi đã bị xóa
          if (statusArray.includes('deleted')) {
            qb.orWhere('application.deletedAt IS NOT NULL');
          }

          // Nếu có status hợp lệ khác, ví dụ 'pending', thì lọc status đó + chưa bị xóa
          const validStatuses = statusArray.filter(
            (s) => s !== 'deleted' && s !== 'expired',
          );
          if (validStatuses.length > 0) {
            qb.orWhere(
              new Brackets((q) => {
                q.where('application.status IN (:...status)', {
                  status: validStatuses,
                }).andWhere('application.deletedAt IS NULL');
              }),
            );
          }

          // Nếu có 'expired' thì thêm điều kiện job.endDate < NOW() và chưa bị xóa
          if (statusArray.includes('expired')) {
            qb.orWhere(
              new Brackets((q) => {
                q.where('job.endDate < NOW()').andWhere(
                  'application.deletedAt IS NULL',
                );
              }),
            );
          }
        }),
      );
    }

    queryBuilder.limit(limit).offset(skip);
    const data = await queryBuilder.getRawMany();

    const signedCV = await Promise.all(
      data.map(async (item) => {
        const { cv } = item;
        const cvUrl = cv ? await this.storageService.getSignedUrl(cv) : '';
        const locations = item.locations.map((location) => location.location);

        return {
          ...item,
          cvUrl,
          locations,
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
      message: 'get all cv successfully',
      result: {
        pagination,
        data: signedCV,
      },
    };
  }

  async getAllReview(queries: AllReviewQueriesDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      userId: user.id,
    });
    if (!findCompany) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    const { limit, page, sort, status } = queries;

    const statusArray = status ?? [];
    const includeDeleted = statusArray.includes('deleted');
    const otherStatuses = statusArray.filter((s) => s !== 'deleted');

    const where: any = {
      companyId: findCompany.id,
    };
    if (includeDeleted && otherStatuses.length > 0) {
      where.deletedAt = Not(IsNull());
      where.status = In(otherStatuses);
    } else if (includeDeleted) {
      where.deletedAt = Not(IsNull());
    } else if (otherStatuses.length > 0) {
      where.status = In(otherStatuses);
      where.deletedAt = IsNull();
    }

    const isValidSort =
      sort &&
      Object.entries(sort).some(([key, value]) => key && value !== undefined);
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.companyReviewRepository.findAndCount({
      where,
      relations: { user: true },
      withDeleted: true,
      order: isValidSort ? sort : { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      totalPages,
      totalItems,
      page,
      limit,
    };
    return {
      message: 'get all review successfully',
      result: {
        pagination,
        data,
      },
    };
  }

  async deleteReview(id: number) {
    await this.companyReviewRepository.softDelete(id);

    const deletedReview = await this.companyReviewRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    return {
      message: 'Deleted review successfully',
      result: deletedReview.deletedAt,
    };
  }

  async changeStatusReview(id: number, body: ChangeStatusReviewDto) {
    const { status } = body;
    await this.companyReviewRepository.update({ id }, { status });
    return {
      message: `${status} review successfully`,
      result: status,
    };
  }
}
