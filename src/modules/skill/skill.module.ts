import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillRepository } from 'src/databases/repositories/skill.repository';

@Module({
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
})
export class SkillModule {}
