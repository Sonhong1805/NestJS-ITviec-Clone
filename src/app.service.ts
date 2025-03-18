import { Injectable } from '@nestjs/common';
import { CompanyRepository } from './databases/repositories/company.repository';
import { SkillRepository } from './databases/repositories/skill.repository';
import { ILike } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly skillRepository: SkillRepository,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async searchByKeyword(keyword: string) {
    const results = await Promise.all([
      this.companyRepository.find({ where: { name: ILike(`%${keyword}%`) } }),
      this.skillRepository.find({ where: { name: ILike(`%${keyword}%`) } }),
    ]);

    const companies = keyword
      ? results[0].map((company) => ({
          id: uuidv4(),
          name: company.name,
          slug: company.slug,
        }))
      : [];
    const skills = keyword
      ? results[1].map((skill) => ({
          id: uuidv4(),
          name: skill.name,
        }))
      : [];

    const MAX_OPTIONS = 8;
    const MIN_OPTIONS = 4;

    let filteredCompanies = [];
    let filteredSkills = [];

    if (skills.length > MIN_OPTIONS) {
      filteredCompanies = companies.slice(0, 4);
      const remainingSlots = MAX_OPTIONS - filteredCompanies.length;
      filteredSkills = skills.slice(0, remainingSlots);
    } else {
      const companyCount = Math.min(companies.length, MIN_OPTIONS);
      const skillCount = Math.min(skills.length, MAX_OPTIONS - companyCount);
      filteredCompanies = companies.slice(0, companyCount);
      filteredSkills = skills.slice(0, skillCount);
    }

    return {
      message: 'get data by keyword successfully',
      result: {
        skills: filteredSkills,
        companies: filteredCompanies,
      },
    };
  }
}
