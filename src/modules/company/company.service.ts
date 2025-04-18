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
import { DataSource } from 'typeorm';
import { convertToSlug } from 'src/commons/utils/convertToSlug';
import { Company } from 'src/databases/entities/company.entity';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { CompanySkill } from 'src/databases/entities/company-skill.entity';
import { CompanySkillRepository } from 'src/databases/repositories/company-skill.repository';
import { Skill } from 'src/databases/entities/skill.entity';
import { CompanyFollowRepository } from 'src/databases/repositories/company-follow.repository';
import { JobRepository } from 'src/databases/repositories/job.repository';

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
  ) {}

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
        },
      );

      const updatedCompany = await queryRunner.manager.findOne(Company, {
        where: { id, userId: user.id },
      });

      if (updatedCompany.logo && updatedCompany.logo !== findCompany.logo) {
        updatedCompany.logo = await this.storageService.getSignedUrl(
          updatedCompany.logo,
        );
      }

      if (findCompany.logo !== logo) {
        await this.storageService.deleteFile(findCompany.logo);
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
        'company.isActive as "isActive"',
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
      .groupBy('job.id, company.id, industry.id');

    const findJobs = await jobQueryBuilder.getRawMany();
    findCompany.jobs = findJobs;

    if (user) {
      const findFollow = await this.companyFollowRepository.findOne({
        where: {
          userId: user.id,
          companyId: findCompany.id,
        },
      });

      findCompany['follow'] = !!findFollow;
    }

    return {
      message: `Get company by ${!isNaN(+param) ? 'userId' : 'slug'} successfully`,
      result: findCompany,
    };
  }

  async createReview(body: ReviewCompanyDto, user: User) {
    const companyReview = await this.companyReviewRepository.save({
      ...body,
      userId: user.id,
    });

    return {
      message: 'create review company successfully',
      result: companyReview,
    };
  }

  async getReview(companyId: number, queries: CompanyReviewQueryDto) {
    const { limit, cursor } = queries;
    const total = await this.companyReviewRepository.count({
      where: { companyId },
    });

    const queryBuilder = await this.companyReviewRepository
      .createQueryBuilder('review')
      .where('review.companyId = :companyId', { companyId })
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
      next = results[length - 1].id;
    }

    return {
      message: 'get review company successfully',
      result: {
        data: results,
        pagination: {
          limit,
          next,
          total,
        },
      },
    };
  }

  async getAll() {
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
        "jsonb_agg(DISTINCT jsonb_build_object('id',skill.id,'name', skill.name)) AS skills",
        "jsonb_agg(DISTINCT jsonb_build_object('id',job.id,'title', job.title)) AS jobs",
      ])
      .groupBy('company.id');
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
}
