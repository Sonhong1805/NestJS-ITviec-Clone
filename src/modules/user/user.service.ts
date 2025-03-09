import { SkillRepository } from '../../databases/repositories/skill.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { ILike } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async create(body: UpsertUserDto) {}

  async update(id: number, body: UpsertUserDto) {}

  async getDetail(id: number) {}

  async delete(id: number) {}
}
