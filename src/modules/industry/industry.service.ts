import { IndustryRepository } from './../../databases/repositories/industry.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { IndustryQueriesDto } from './dto/industry-query.dto';
import { ILike } from 'typeorm';

@Injectable()
export class IndustryService {
  constructor(private readonly industryRepository: IndustryRepository) {}

  async create(body: UpsertIndustryDto) {
    const newIndustry = await this.industryRepository.save(body);
    return {
      message: 'Create industry successfully',
      result: newIndustry,
    };
  }

  async update(id: number, body: UpsertIndustryDto) {
    const findIndustry = await this.industryRepository.findOneBy({ id });

    if (!findIndustry) {
      throw new HttpException('industry not found', HttpStatus.NOT_FOUND);
    }
    const updatedIndustry = await this.industryRepository.save({
      ...findIndustry,
      ...body,
    });

    return {
      message: 'Update industry successfully',
      result: updatedIndustry,
    };
  }

  async getDetail(id: number) {
    const findIndustry = await this.industryRepository.findOneBy({ id });

    return {
      message: 'get detail industry successfully',
      result: findIndustry,
    };
  }

  async delete(id: number) {
    await this.industryRepository.delete({ id });

    return {
      message: 'delete industry successfully',
    };
  }

  async getAll(queries: IndustryQueriesDto) {
    const { name } = queries;
    const whereClause = name
      ? {
          name: ILike(`%${name}%`),
        }
      : {};
    const allIndustry = await this.industryRepository.find({
      where: whereClause,
    });
    return {
      message: 'Get all industry successfully',
      result: allIndustry,
    };
  }
}
