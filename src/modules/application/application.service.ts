import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from 'src/databases/entities/user.entity';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly storageService: StorageService,
  ) {}

  async create(body: CreateApplicationDto, user: User) {
    const findJob = await this.jobRepository.findOne({
      where: {
        id: body.jobId,
      },
    });

    if (!findJob) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
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

  async getAllByJob(jobId: number, user: User) {
    const findJob = await this.jobRepository.findOne({
      where: {
        id: jobId,
      },
      relations: ['company'],
    });

    if (!findJob) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    if (findJob.company.userId !== user.id) {
      throw new HttpException('company not access', HttpStatus.FORBIDDEN);
    }

    const result = await this.applicationRepository.find({
      where: {
        jobId,
      },
      relations: ['applicant'],
    });

    return {
      message: 'Get all application by Job',
      result,
    };
  }
}
