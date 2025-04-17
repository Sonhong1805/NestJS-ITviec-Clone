import { StorageService } from './../storage/storage.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async getDetailByUser(userId: number) {
    const queryBuilder = await this.applicantRepository
      .createQueryBuilder('applicant')
      .leftJoin('applicant.applicantLocations', 'al')
      .select([
        'applicant.id AS "id"',
        'applicant.userId AS "userId"',
        'applicant.title AS "title"',
        'applicant.cv AS "cv"',
        'applicant.address AS "address"',
        'applicant.city AS "city"',
        'applicant.gender AS "gender"',
        'applicant.link AS "link"',
        'applicant.dob AS "dob"',
        'applicant.avatar AS "avatar"',
        `COALESCE(
          JSON_AGG(
            json_build_object('id', al.id, 'location', al.location)
          ) FILTER (WHERE al.id IS NOT NULL), '[]'
        ) AS locations`,
      ])
      .where('applicant.userId = :userId', { userId })
      .groupBy('applicant.id');

    const findApplicant = await queryBuilder.getRawOne();
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }
    if (findApplicant.cv) {
      findApplicant.cvUrl = await this.storageService.getSignedUrl(
        findApplicant.cv,
      );
    }
    return {
      message: 'get applicant by user id successfully',
      result: findApplicant,
    };
  }

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
