import { SkillRepository } from './../../databases/repositories/skill.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpsertSkillDto } from './dto/upsert-skill.dto';
import { SkillQueriesDto } from './dto/skill-query.dto';
import { ILike } from 'typeorm';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async create(body: UpsertSkillDto) {
    const newSkill = await this.skillRepository.save(body);
    return {
      message: 'Create skill successfully',
      result: newSkill,
    };
  }

  async update(id: number, body: UpsertSkillDto) {
    const findSkill = await this.skillRepository.findOneBy({ id });

    if (!findSkill) {
      throw new HttpException('skill not found', HttpStatus.NOT_FOUND);
    }
    const updatedSkill = await this.skillRepository.save({
      ...findSkill,
      ...body,
    });

    return {
      message: 'Update skill successfully',
      result: updatedSkill,
    };
  }

  async getDetail(id: number) {
    const findSkill = await this.skillRepository.findOneBy({ id });

    return {
      message: 'get detail skill successfully',
      result: findSkill,
    };
  }

  async delete(id: number) {
    await this.skillRepository.delete({ id });

    return {
      message: 'delete skill successfully',
    };
  }

  async getAll(queries: SkillQueriesDto) {
    const { name } = queries;
    const whereClause = name
      ? {
          name: ILike(`%${name}%`),
        }
      : {};
    const allSkill = await this.skillRepository.find({
      where: whereClause,
    });
    return {
      message: 'Get all skill successfully',
      result: allSkill,
    };
  }
}
