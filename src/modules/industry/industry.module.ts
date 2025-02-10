import { Module } from '@nestjs/common';
import { IndustryController } from './industry.controller';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';
import { IndustryService } from './industry.service';

@Module({
  controllers: [IndustryController],
  providers: [IndustryService, IndustryRepository],
})
export class IndustryModule {}
