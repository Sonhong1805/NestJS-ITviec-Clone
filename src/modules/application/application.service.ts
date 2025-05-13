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
import { DataSource, LessThan } from 'typeorm';
import { Application } from 'src/databases/entities/application.entity';
import { Applicant } from 'src/databases/entities/applicant.entity';
import { ApplicantLocation } from 'src/databases/entities/applicant-location.entity';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';
import { validateCVFile } from 'src/commons/utils/validateCVFile';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';

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

    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    const findApplication = await this.applicationRepository.findOne({
      where: {
        jobId: findJob.id,
        applicantId: findApplicant.id,
      },
    });

    if (findApplication) {
      throw new HttpException('You already applied', HttpStatus.CONFLICT);
    }

    let cv = findApplicant.cv;
    if (file) {
      await this.storageService.deleteFile(findApplicant.cv);

      const { contentType } = validateCVFile(file);
      const filePath = `/cvs/${Date.now()}/${file.originalname}`;
      const uploadResult = await this.storageService.uploadFile(
        filePath,
        file.buffer,
        {
          upsert: true,
          contentType,
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
        applicantId: findApplicant.id,
        fullName,
        coverLetter,
        status: 'pending',
      });

      delete body.locations;

      const applicantLocations = locations.map((location) => ({
        applicantId: findApplicant.id,
        location,
      }));

      await this.applicantLocationRepository.delete({
        applicantId: findApplicant.id,
      });

      await queryRunner.manager.save(ApplicantLocation, applicantLocations);

      await queryRunner.manager.update(
        Applicant,
        { id: findApplicant.id },
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

  async getJobStatus(queries: CommonQueryDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const { sort, limit, page } = queries;
    const skip = (page - 1) * limit;

    const status = sort['status'];
    delete sort['status'];

    const where: any = {
      applicantId: findApplicant.id,
    };

    if (status === ('expired' as any)) {
      where.job = {
        endDate: LessThan(new Date()),
      };
    } else {
      where.status = status;
    }
    const [data, totalItems] = await this.applicationRepository.findAndCount({
      where,
      relations: {
        job: {
          company: true,
        },
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        job: {
          id: true,
          title: true,
          slug: true,
          minSalary: true,
          maxSalary: true,
          currencySalary: true,
          location: true,
          workingModel: true,
          startDate: true,
          endDate: true,
          company: {
            name: true,
            logo: true,
          },
        },
      },
      order: sort,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      totalPages,
      totalItems,
      page,
      limit,
    };

    const signedJobs = await Promise.all(
      data.map(async (jobItem) => {
        const logoKey = jobItem.job.company.logo;
        const companyName = jobItem.job.company.name;

        let signedLogoUrl: string | null = null;
        if (logoKey) {
          signedLogoUrl = await this.storageService.getSignedUrl(logoKey);
        }

        jobItem.job.company = {
          ...(jobItem.job.company as any),
          companyName,
          logo: signedLogoUrl,
        };

        return jobItem;
      }),
    );
    return {
      message: 'get job status successfully',
      result: {
        pagination,
        data: signedJobs,
      },
    };
  }
}
