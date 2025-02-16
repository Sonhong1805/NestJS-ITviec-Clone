import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly industryRepository: IndustryRepository,
    private readonly storageService: StorageService,
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
}
