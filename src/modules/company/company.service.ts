import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';
import { ReviewCompanyDto } from './dto/review-company.dto';
import { CompanyReviewRepository } from 'src/databases/repositories/company-review.repository';
import { CompanyReviewQueryDto } from './dto/company-review-query.dto';
import { query } from 'express';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly industryRepository: IndustryRepository,
    private readonly storageService: StorageService,
    private readonly companyReviewRepository: CompanyReviewRepository,
  ) {}

  async update(id: number, body: UpdateCompanyDto, user: User) {
    const findCompany = await this.companyRepository.findOneBy({
      id,
      userId: user.id,
    });

    if (!findCompany) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }

    if (body.logo) {
      await this.storageService.getSignedUrl(body.logo);
    }

    const findIndustry = await this.industryRepository.findOneBy({
      id: body.industryId,
    });

    if (!findIndustry) {
      throw new HttpException('industry not found', HttpStatus.NOT_FOUND);
    }

    const updatedCompany = await this.companyRepository.save({
      ...findCompany,
      ...body,
    });

    if (updatedCompany.logo) {
      updatedCompany.logo = await this.storageService.getSignedUrl(
        updatedCompany.logo,
      );
    }

    if (findCompany.logo !== body.logo) {
      await this.storageService.deleteFile(findCompany.logo);
    }

    return {
      message: 'Update company successfully',
      result: updatedCompany,
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
}
