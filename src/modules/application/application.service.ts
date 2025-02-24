import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from 'src/databases/entities/user.entity';
import { ManuscriptRepository } from 'src/databases/repositories/manuscript.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly manuscriptRepository: ManuscriptRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly storageService: StorageService,
  ) {}

  async create(body: CreateApplicationDto, user: User) {
    const findManuscript = await this.manuscriptRepository.findOne({
      where: {
        id: body.manuscriptId,
      },
    });

    if (!findManuscript) {
      throw new HttpException('manuscript not found', HttpStatus.NOT_FOUND);
    }

    const findAppicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (body.resume) {
      await this.storageService.getSignedUrl(body.resume);
    }

    const newApplication = await this.applicationRepository.save({
      ...body,
      applicantId: findAppicant.id,
    });

    return {
      message: 'Create application successfully',
      result: newApplication,
    };
  }

  async getAllByManuscript(manuscriptId: number, user: User) {
    const findManuscript = await this.manuscriptRepository.findOne({
      where: {
        id: manuscriptId,
      },
      relations: ['company'],
    });

    if (!findManuscript) {
      throw new HttpException('manuscript not found', HttpStatus.NOT_FOUND);
    }

    if (findManuscript.company.userId !== user.id) {
      throw new HttpException('company not access', HttpStatus.FORBIDDEN);
    }

    const result = await this.applicationRepository.find({
      where: {
        manuscriptId,
      },
      relations: ['applicant'],
    });

    return {
      message: 'Get all application by manuscript',
      result,
    };
  }
}
