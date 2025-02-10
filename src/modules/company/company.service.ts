import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { CompanyRepository } from 'src/databases/repositories/company.repository';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async update(id: number, body: UpdateCompanyDto) {
    const findCompany = await this.companyRepository.findOneBy({ id });

    if (!findCompany) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND);
    }
    const updatedCompany = await this.companyRepository.save({
      ...findCompany,
      ...body,
    });

    return {
      message: 'Update company successfully',
      result: updatedCompany,
    };
  }
}
