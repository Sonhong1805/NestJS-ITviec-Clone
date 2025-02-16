import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { StorageService } from '../storage/storage.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    StorageService,
    IndustryRepository,
  ],
})
export class CompanyModule {}
