import { Module } from '@nestjs/common';
import { ManuscriptController } from './manuscript.controller';
import { ManuscriptService } from './manuscript.service';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { ManuscriptSkillRepository } from 'src/databases/repositories/manuscript-skill.repository';
import { ResdisService } from '../redis/redis.service';

@Module({
  controllers: [ManuscriptController],
  providers: [
    ManuscriptService,
    ManuscriptRepository,
    CompanyRepository,
    ManuscriptSkillRepository,
    ResdisService,
  ],
})
export class ManuscriptModule {}
