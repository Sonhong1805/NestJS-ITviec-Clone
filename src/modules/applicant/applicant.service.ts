import { StorageService } from './../storage/storage.service';
import { Injectable } from '@nestjs/common';
import { User } from 'src/databases/entities/user.entity';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpsertApplicantSkillDto } from './dto/upsert-applicant-skill.dto';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly storageService: StorageService,
    private readonly applicantRepository: ApplicantRepository,
    private readonly applicantSkillRepository: ApplicantSkillRepository,
  ) {}

  async update(body: UpdateApplicantDto, user: User) {
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (body.avatar) {
      await this.storageService.getSignedUrl(body.avatar);
    }

    const updatedApplicant = await this.applicantRepository.save({
      ...findApplicant,
      ...body,
    });

    return {
      message: 'updated applicant successfully',
      result: updatedApplicant,
    };
  }

  async createSkill(body: UpsertApplicantSkillDto, user: User) {
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    const newApplicantSkill = await this.applicantSkillRepository.save({
      ...body,
      applicantId: findApplicant.id,
    });

    return {
      message: 'create applicant skill successfully',
      result: newApplicantSkill,
    };
  }

  async updateSkill(id: number, body: UpsertApplicantSkillDto, user: User) {
    const findApplicantSkill = await this.applicantSkillRepository.findOneBy({
      id,
    });

    const updatedApplicantSkill = await this.applicantSkillRepository.save({
      ...findApplicantSkill,
      ...body,
    });

    return {
      message: 'update applicant skill successfully',
      result: updatedApplicantSkill,
    };
  }

  async getSkills(user: User) {
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    const findApplicantSkill = await this.applicantSkillRepository.find({
      where: {
        applicantId: findApplicant.id,
      },
    });

    return {
      message: 'get applicant skills successfully',
      result: findApplicantSkill,
    };
  }
}
