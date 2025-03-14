import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillRepository } from 'src/databases/repositories/skill.repository';
import { ResdisService } from '../redis/redis.service';

@Module({
  controllers: [SkillController],
  providers: [SkillService, SkillRepository, ResdisService],
})
export class SkillModule {}
