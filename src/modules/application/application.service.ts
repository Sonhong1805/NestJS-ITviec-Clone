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
import { ApplicationLocation } from 'src/databases/entities/application-location.entity';
import { ChangeStatusDto } from './dto/change-status.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { UserRepository } from 'src/databases/repositories/user.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly applicantLocationRepository: ApplicantLocationRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async create(
    slug: string,
    file: Express.Multer.File,
    body: CreateApplicationDto,
    user: User,
  ) {
    const { fullName, email, phoneNumber, coverLetter, locations } = body;

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
      const cvUsageCount = await this.applicationRepository.count({
        where: {
          cv: findApplicant.cv,
          applicantId: findApplicant.id,
        },
      });

      if (findApplicant.cv && cvUsageCount === 0) {
        await this.storageService.deleteFile(findApplicant.cv);
      }

      const { contentType } = validateCVFile(file);
      const filePath = `/cvs/${Date.now()}/${file.originalname}`;
      const uploadResult = this.storageService.uploadFile(
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
        cv,
        fullName,
        phoneNumber,
        coverLetter,
        status: 'pending',
      });

      const applicationLocations = locations.map((location) => ({
        applicationId: newApplication.id,
        location,
      }));

      await queryRunner.manager.save(ApplicationLocation, applicationLocations);

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

      if (newApplication) {
        const findCompany = await this.companyRepository.findOneBy({
          id: findJob.companyId,
        });
        await this.mailQueue.add('application-success', {
          username: fullName,
          email,
          job: findJob.title,
          company: findCompany.name,
        });
      }

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

  async delete(id: number) {
    await this.applicationRepository.softDelete(id);

    const deletedApplication = await this.applicationRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    return {
      message: 'Deleted application successfully',
      result: deletedApplication.deletedAt,
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

  async changeStatus(id: number, body: ChangeStatusDto) {
    const { status, fullName, jobId, applicantId } = body;
    await this.applicationRepository.update({ id }, { status });

    const findJob = await this.jobRepository.findOneBy({ id: jobId });
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    const findUser = await this.userRepository.findOneBy({
      id: findApplicant.userId,
    });

    const findCompany = await this.companyRepository.findOneBy({
      id: findJob.companyId,
    });

    if (status === 'accepted') {
      await this.mailQueue.add('cv-accepted', {
        username: fullName,
        email: findUser.email,
        job: findJob.title,
        company: findCompany.name,
      });
    } else {
      await this.mailQueue.add('cv-reject', {
        username: fullName,
        email: findUser.email,
        job: findJob.title,
        company: findCompany.name,
      });
    }

    return {
      message: `${status} this cv successfully`,
      result: status,
    };
  }
}
