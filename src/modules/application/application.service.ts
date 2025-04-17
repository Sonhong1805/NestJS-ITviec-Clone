import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from 'src/databases/entities/user.entity';
import { JobRepository } from 'src/databases/repositories/job.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { DataSource } from 'typeorm';
import { Application } from 'src/databases/entities/application.entity';
import { Applicant } from 'src/databases/entities/applicant.entity';
import { ApplicantLocation } from 'src/databases/entities/applicant-location.entity';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly applicantLocationRepository: ApplicantLocationRepository,
  ) {}

  async create(
    slug: string,
    file: Express.Multer.File,
    body: CreateApplicationDto,
    user: User,
  ) {
    const { fullName, phoneNumber, coverLetter, locations } = body;

    const findJob = await this.jobRepository.findOneBy({
      slug,
    });

    if (!findJob) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    const findAppicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    const findAppication = await this.applicationRepository.findOne({
      where: {
        jobId: findJob.id,
        applicantId: findAppicant.id,
      },
    });

    if (findAppication) {
      throw new HttpException('You already applied', HttpStatus.CONFLICT);
    }

    let cv = findAppicant.cv;
    if (file) {
      await this.storageService.deleteFile(findAppicant.cv);

      const [_, fileType] = file.originalname.split('.');
      const validFileType = ['pdf', 'docx', 'doc'];
      const validContentTypes: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        doc: 'application/msword',
      };

      if (!validFileType.includes(fileType)) {
        throw new BadRequestException(
          'Invalid mine type. only pdf, doc, docx file are allowed',
        );
      }

      const maxSizeBytes = 3 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new BadRequestException('File size exceeds the 3MB');
      }

      const filePath = `/cvs/${Date.now()}/${file.originalname}`;
      const uploadResult = await this.storageService.uploadFile(
        filePath,
        file.buffer,
        {
          upsert: true,
          contentType: validContentTypes[fileType],
        },
      );
      cv = (await uploadResult).path;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const newApplication = await queryRunner.manager.save(Application, {
        jobId: findJob.id,
        applicantId: findAppicant.id,
        fullName,
        coverLetter,
      });

      delete body.locations;

      const applicantLocations = locations.map((location) => ({
        applicantId: findAppicant.id,
        location,
      }));

      await this.applicantLocationRepository.delete({
        applicantId: findAppicant.id,
      });

      await queryRunner.manager.save(ApplicantLocation, applicantLocations);

      await queryRunner.manager.update(
        Applicant,
        { id: findAppicant.id },
        {
          cv,
        },
      );

      await queryRunner.manager.update(
        User,
        { id: user.id },
        {
          phoneNumber,
        },
      );
      await queryRunner.commitTransaction();

      return {
        message: 'Create application successfully',
        result: newApplication,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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
