import { StorageService } from './../storage/storage.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/databases/entities/user.entity';
import { ApplicantSkillRepository } from 'src/databases/repositories/applicant-skill.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { validateCVFile } from 'src/commons/utils/validateCVFile';
import { UpdatePersonalInfomationDto } from './dto/update-personal-infomation.dto';
import { DataSource } from 'typeorm';
import { ApplicantLocation } from 'src/databases/entities/applicant-location.entity';
import { ApplicantLocationRepository } from 'src/databases/repositories/applicant-location.repository';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { UpdateGeneralInfomationDto } from './dto/update-general-infomation.dto';
import { ApplicantWorkingModelRepository } from 'src/databases/repositories/applicant-working-model.repository';
import { Applicant } from 'src/databases/entities/applicant.entity';
import { ApplicantWorkingModel } from 'src/databases/entities/applicant-working-model';
import { ApplicantIndustry } from 'src/databases/entities/applicant-industry.entity';
import { UpdateContactInfomationDto } from './dto/update-contact-infomation.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { UpdateAboutMeDto } from './dto/update-about-me.dto';
import { UpsertEducationDto } from './dto/upsert-education.dto';
import { ApplicantEducationRepository } from 'src/databases/repositories/applicant-education.repository';
import { ApplicantExperienceRepository } from 'src/databases/repositories/applicant-experience.repository';
import { UpsertExperienceDto } from './dto/upsert-experience.dto';
import { ApplicantProjectRepository } from 'src/databases/repositories/applicant-project.repository';
import { UpsertProjectDto } from './dto/upsert-project.dto';
import { UpsertCertificateDto } from './dto/upsert-certificate.dto';
import { ApplicantCertificateRepository } from 'src/databases/repositories/applicant-certificate.repository';
import { ApplicantAwardRepository } from 'src/databases/repositories/applicant-award.repository';
import { UpsertAwardDto } from './dto/upsert-award.dto';
import { WishlistRepository } from 'src/databases/repositories/wishlist.repository';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { JobViewRepository } from 'src/databases/repositories/job-view.repository';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly storageService: StorageService,
    private readonly applicantRepository: ApplicantRepository,
    private readonly applicantSkillRepository: ApplicantSkillRepository,
    private readonly dataSource: DataSource,
    private readonly applicantLocationRepository: ApplicantLocationRepository,
    private readonly applicantWorkingModelRepository: ApplicantWorkingModelRepository,
    private readonly userRepository: UserRepository,
    private readonly applicantEducationRepository: ApplicantEducationRepository,
    private readonly applicantExperienceRepository: ApplicantExperienceRepository,
    private readonly applicantProjectRepository: ApplicantProjectRepository,
    private readonly applicantCertificateRepository: ApplicantCertificateRepository,
    private readonly applicantAwardRepository: ApplicantAwardRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly jobViewRepository: JobViewRepository,
    private readonly applicationRepository: ApplicationRepository,
  ) {}

  async getDetailByUser(userId: number) {
    const queryBuilder = await this.applicantRepository
      .createQueryBuilder('applicant')
      .leftJoin('applicant.applicantLocations', 'al')
      .leftJoin('applicant.applicantWorkingModels', 'wm')
      .leftJoin('applicant.applicantIndustries', 'ai')
      .leftJoin('ai.industry', 'industry')
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
        'applicant.totalYears AS "totalYears"',
        'applicant.currentLevel AS "currentLevel"',
        'applicant.expectedSalaryCurrency AS "expectedSalaryCurrency"',
        'applicant.currentSalaryCurrency AS "currentSalaryCurrency"',
        'applicant.salaryFrom AS "salaryFrom"',
        'applicant.salaryTo AS "salaryTo"',
        'applicant.currentSalary AS "currentSalary"',
        'applicant.coverLetter AS "coverLetter"',
        'applicant.aboutMe AS "aboutMe"',
        'applicant.createdAt AS "createdAt"',
        'applicant.updatedAt AS "updatedAt"',
        'applicant.deletedAt AS "deletedAt"',
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('id', al.id, 'location', al.location)
          ) FILTER (WHERE al.id IS NOT NULL), '[]'
        ) AS "locations"`,
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('id', wm.id, 'name', wm.name)
          ) FILTER (WHERE wm.id IS NOT NULL), '[]'
        ) AS "expectedWorkingModels"`,
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('id', industry.id, 'name_en', industry.name_en,'name_vi', industry.name_vi)
          ) FILTER (WHERE industry.id IS NOT NULL), '[]'
        ) AS "industryExperiences"`,
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

  async createSkills(body: CreateSkillDto, user: User) {
    const { skills } = body;
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    await this.applicantSkillRepository.delete({
      applicantId: findApplicant.id,
    });

    await Promise.all(
      skills.map((skill) =>
        this.applicantSkillRepository.save({
          ...skill,
          applicantId: findApplicant.id,
        }),
      ),
    );

    const applicantSkills = await this.applicantSkillRepository.find({
      where: {
        applicantId: findApplicant.id,
      },
      relations: { skill: true },
    });

    const filteredSkills = applicantSkills.map((applicantSkill) => {
      const skill = applicantSkill.skill;
      return {
        id: skill.id,
        name: skill.name,
        level: applicantSkill.level,
      };
    });

    return {
      message: 'Updated successfully',
      result: filteredSkills,
    };
  }

  async getSkills(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const applicantSkills = await this.applicantSkillRepository.find({
      where: {
        applicantId,
      },
      relations: { skill: true },
    });

    const filteredSkills = applicantSkills.map((applicantSkill) => {
      const skill = applicantSkill.skill;
      return {
        id: skill.id,
        name: skill.name,
        level: applicantSkill.level,
      };
    });

    return {
      message: 'get applicant skills successfully',
      result: filteredSkills,
    };
  }

  async uploadCV(file: Express.Multer.File, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });

    let cv = findApplicant.cv;
    if (file) {
      await this.storageService.deleteFile(findApplicant.cv);

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

    const updatedApplicant = await this.applicantRepository.save({
      ...findApplicant,
      cv,
    });

    if (updatedApplicant) {
      updatedApplicant['cvUrl'] = await this.storageService.getSignedUrl(
        updatedApplicant.cv,
      );
    }

    return {
      message: 'Uploaded successfully',
      result: updatedApplicant,
    };
  }

  async updatePersonalInfomation(
    body: UpdatePersonalInfomationDto,
    user: User,
  ) {
    const { locations } = body;
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      delete body.locations;

      const applicantLocations = locations.map((location) => ({
        applicantId: findApplicant.id,
        location,
      }));

      await this.applicantLocationRepository.delete({
        applicantId: findApplicant.id,
      });

      await queryRunner.manager.save(ApplicantLocation, applicantLocations);

      await queryRunner.manager.update(User, { id: user.id }, { ...body });

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });
      await queryRunner.commitTransaction();

      delete updatedUser.password;
      delete updatedUser.refreshToken;

      return {
        message: 'Updated successfully',
        result: updatedUser,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateGeneralInfomation(body: UpdateGeneralInfomationDto, user: User) {
    const { expectedWorkingModels, industryExperiences } = body;
    const findApplicant = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      delete body.expectedWorkingModels;
      delete body.industryExperiences;

      const applicantWorkingModels = expectedWorkingModels.map(
        (workingModel) => ({
          applicantId: findApplicant.id,
          name: workingModel,
        }),
      );

      await this.applicantWorkingModelRepository.delete({
        applicantId: findApplicant.id,
      });

      await queryRunner.manager.save(
        ApplicantWorkingModel,
        applicantWorkingModels,
      );

      const applicantIndustries = industryExperiences.map((industryId) => ({
        applicantId: findApplicant.id,
        industryId,
      }));

      await queryRunner.manager.delete(ApplicantIndustry, {
        applicantId: findApplicant.id,
      });

      await queryRunner.manager.save(ApplicantIndustry, applicantIndustries);

      await queryRunner.manager.update(
        Applicant,
        { id: findApplicant.id },
        { ...body },
      );

      const updatedApplicant = await queryRunner.manager.findOne(Applicant, {
        where: {
          id: findApplicant.id,
        },
        select: {
          totalYears: true,
          currentLevel: true,
          salaryFrom: true,
          salaryTo: true,
          currentSalary: true,
          currentSalaryCurrency: true,
          expectedSalaryCurrency: true,
        },
      });

      const updatedApplicantWorkingModels = await queryRunner.manager.find(
        ApplicantWorkingModel,
        {
          where: {
            applicantId: findApplicant.id,
          },
          select: { id: true, name: true },
        },
      );

      updatedApplicant['expectedWorkingModels'] = updatedApplicantWorkingModels;

      const updatedApplicantIndustries = await queryRunner.manager.find(
        ApplicantIndustry,
        {
          where: {
            applicantId: findApplicant.id,
          },
          relations: ['industry'],
        },
      );

      const filteredIndustries = updatedApplicantIndustries.map(
        (applicantIndustry) => {
          const industry = applicantIndustry.industry;
          return {
            id: industry.id,
            name_en: industry.nameEn,
            name_vi: industry.nameVi,
          };
        },
      );

      updatedApplicant['industryExperiences'] = filteredIndustries;
      await queryRunner.commitTransaction();

      return {
        message: 'Updated successfully',
        result: updatedApplicant,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateCoverLetter(body: UpdateCoverLetterDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const updatedApplicant = await this.applicantRepository.save({
      ...findApplicant,
      coverLetter: body.coverLetter,
    });

    return {
      message: 'Updated cover letter successfully',
      result: updatedApplicant.coverLetter,
    };
  }

  async updateContactInfomation(
    file: Express.Multer.File,
    body: UpdateContactInfomationDto,
    user: User,
  ) {
    const { username, title, address, city, dob, gender, link, phoneNumber } =
      body;
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    let avatar = findApplicant.avatar;

    if (body.avatar === '' && findApplicant.avatar) {
      await this.storageService.deleteFile(findApplicant.avatar);
      avatar = '';
    }

    if (file) {
      await this.storageService.deleteFile(findApplicant.avatar);
      const validMineType = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMineType.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid mine type. only images are allowed',
        );
      }

      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new BadRequestException('File size exceeds the 5MB');
      }

      const filePath = `/images/${Date.now()}/${file.originalname}`;
      const uploadResult = this.storageService.uploadFile(
        filePath,
        file.buffer,
      );
      avatar = (await uploadResult).path;
    }

    await this.userRepository.update(
      { id: user.id },
      { username, phoneNumber },
    );
    const updatedApplicant = await this.applicantRepository.save({
      ...findApplicant,
      title,
      address,
      city,
      dob,
      gender,
      link,
      avatar,
    });

    let avatarUrl = '';
    if (updatedApplicant.avatar) {
      avatarUrl = await this.storageService.getSignedUrl(
        updatedApplicant.avatar,
      );
    }

    updatedApplicant['avatarUrl'] = avatarUrl;
    updatedApplicant['username'] = username;
    updatedApplicant['phoneNumber'] = phoneNumber;

    return {
      message: 'Updated successfully',
      result: updatedApplicant,
    };
  }

  async updateAboutMe(body: UpdateAboutMeDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const updatedApplicant = await this.applicantRepository.save({
      ...findApplicant,
      aboutMe: body.aboutMe,
    });

    return {
      message: 'Updated cover letter successfully',
      result: updatedApplicant.aboutMe,
    };
  }

  async createEducation(body: UpsertEducationDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const createdEducation = await this.applicantEducationRepository.save({
      applicantId: findApplicant.id,
      ...body,
    });

    return {
      message: 'Updated successfully',
      result: createdEducation,
    };
  }

  async getEducations(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const educations = await this.applicantEducationRepository.find({
      where: {
        applicantId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'get educations successfully',
      result: educations,
    };
  }

  async updateEducation(id: number, body: UpsertEducationDto) {
    const education = await this.applicantEducationRepository.findOneBy({
      id,
    });
    const updatedEducation = await this.applicantEducationRepository.save({
      ...education,
      ...body,
    });
    return {
      message: 'Updated successfully',
      result: updatedEducation,
    };
  }

  async deleteEducation(id: number) {
    await this.applicantEducationRepository.delete({
      id,
    });

    return {
      message: 'You deleted an Education.',
      result: id,
    };
  }

  async createExperience(body: UpsertExperienceDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const createdExperience = await this.applicantExperienceRepository.save({
      applicantId: findApplicant.id,
      ...body,
    });

    return {
      message: 'Updated successfully',
      result: createdExperience,
    };
  }

  async getExperiences(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const experiences = await this.applicantExperienceRepository.find({
      where: {
        applicantId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'get experiences successfully',
      result: experiences,
    };
  }

  async updateExperience(id: number, body: UpsertExperienceDto) {
    const experience = await this.applicantExperienceRepository.findOneBy({
      id,
    });
    const updatedExperience = await this.applicantExperienceRepository.save({
      ...experience,
      ...body,
    });
    return {
      message: 'Updated successfully',
      result: updatedExperience,
    };
  }

  async deleteExperience(id: number) {
    await this.applicantExperienceRepository.delete({
      id,
    });

    return {
      message: 'You deleted an Experience.',
      result: id,
    };
  }

  async createProject(body: UpsertProjectDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const createdProject = await this.applicantProjectRepository.save({
      applicantId: findApplicant.id,
      ...body,
    });

    return {
      message: 'Updated successfully',
      result: createdProject,
    };
  }

  async getProjects(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const projects = await this.applicantProjectRepository.find({
      where: {
        applicantId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'get projects successfully',
      result: projects,
    };
  }

  async updateProject(id: number, body: UpsertProjectDto) {
    const project = await this.applicantProjectRepository.findOneBy({
      id,
    });
    const updatedProject = await this.applicantProjectRepository.save({
      ...project,
      ...body,
    });
    return {
      message: 'Updated successfully',
      result: updatedProject,
    };
  }

  async deleteProject(id: number) {
    await this.applicantProjectRepository.delete({
      id,
    });

    return {
      message: 'You deleted an Project.',
      result: id,
    };
  }

  async createCertificate(body: UpsertCertificateDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const createdCertificate = await this.applicantCertificateRepository.save({
      applicantId: findApplicant.id,
      ...body,
    });

    return {
      message: 'Updated successfully',
      result: createdCertificate,
    };
  }

  async getCertificates(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const certificates = await this.applicantCertificateRepository.find({
      where: {
        applicantId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'get certificates successfully',
      result: certificates,
    };
  }

  async updateCertificate(id: number, body: UpsertCertificateDto) {
    const certificate = await this.applicantCertificateRepository.findOneBy({
      id,
    });
    const updatedCertificate = await this.applicantCertificateRepository.save({
      ...certificate,
      ...body,
    });
    return {
      message: 'Updated successfully',
      result: updatedCertificate,
    };
  }

  async deleteCertificate(id: number) {
    await this.applicantCertificateRepository.delete({
      id,
    });

    return {
      message: 'You deleted an Certificate.',
      result: id,
    };
  }

  async createAward(body: UpsertAwardDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const createdAward = await this.applicantAwardRepository.save({
      applicantId: findApplicant.id,
      ...body,
    });

    return {
      message: 'Updated successfully',
      result: createdAward,
    };
  }

  async getAwards(applicantId: number) {
    const findApplicant = await this.applicantRepository.findOneBy({
      id: applicantId,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const awards = await this.applicantAwardRepository.find({
      where: {
        applicantId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'get awards successfully',
      result: awards,
    };
  }

  async updateAward(id: number, body: UpsertAwardDto) {
    const Award = await this.applicantAwardRepository.findOneBy({
      id,
    });
    const updatedAward = await this.applicantAwardRepository.save({
      ...Award,
      ...body,
    });
    return {
      message: 'Updated successfully',
      result: updatedAward,
    };
  }

  async deleteAward(id: number) {
    await this.applicantAwardRepository.delete({
      id,
    });

    return {
      message: 'You deleted an Award.',
      result: id,
    };
  }

  async getSavedJobs(query: CommonQueryDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const { sort } = query;

    const optionSort =
      sort['endDate'] === 'ASC' ? { job: { endDate: 'ASC' as const } } : sort;

    const savedJobs = await this.wishlistRepository.find({
      where: {
        userId: user.id,
      },
      relations: {
        job: {
          company: true,
        },
      },
      select: {
        id: true,
        createdAt: true,
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
      order: optionSort,
      take: 20,
    });

    const signedJobs = await Promise.all(
      savedJobs.map(async (jobItem) => {
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
        jobItem.job['wishlist'] = false;
        const findWishlist = await this.wishlistRepository.findOne({
          where: {
            userId: user.id,
            jobId: jobItem.job.id,
          },
        });
        if (findWishlist) {
          jobItem.job['wishlist'] = true;
        }

        jobItem.job['hasApplied'] = null;
        const findApplication = await this.applicationRepository.findOne({
          where: {
            applicantId: findApplicant.id,
            jobId: jobItem.job.id,
          },
        });
        if (findApplication) {
          jobItem.job['hasApplied'] = findApplication;
        }
        return jobItem;
      }),
    );

    return {
      message: 'get saved jobs successfully',
      result: signedJobs,
    };
  }

  async getResentViewdJobs(queries: CommonQueryDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }

    const { sort, limit, page } = queries;
    const skip = (page - 1) * limit;
    const optionSort = (() => {
      if (sort && sort['endDate'] === 'ASC') {
        return { job: { endDate: 'ASC' as const } };
      } else if (sort && sort['startDate'] === 'DESC') {
        return { job: { startDate: 'DESC' as const } };
      } else {
        return sort;
      }
    })();

    const [data, totalItems] = await this.jobViewRepository.findAndCount({
      where: {
        userId: user.id,
      },
      relations: {
        job: {
          company: true,
        },
      },
      select: {
        id: true,
        createdAt: true,
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
      order: optionSort,
      skip,
      take: limit,
    });

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

        jobItem.job['wishlist'] = false;
        const findWishlist = await this.wishlistRepository.findOne({
          where: {
            userId: user.id,
            jobId: jobItem.job.id,
          },
        });
        if (findWishlist) {
          jobItem.job['wishlist'] = true;
        }

        jobItem.job['hasApplied'] = null;
        const findApplication = await this.applicationRepository.findOne({
          where: {
            applicantId: findApplicant.id,
            jobId: jobItem.job.id,
          },
        });
        if (findApplication) {
          jobItem.job['hasApplied'] = findApplication;
        }
        return jobItem;
      }),
    );

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      totalPages,
      totalItems,
      page,
      limit,
    };

    return {
      message: 'get resent viewd jobs successfully',
      result: {
        pagination,
        data: signedJobs,
      },
    };
  }

  async getAppliedJobs(queries: CommonQueryDto, user: User) {
    const findApplicant = await this.applicantRepository.findOneBy({
      userId: user.id,
    });
    if (!findApplicant) {
      throw new HttpException('applicant not found', HttpStatus.NOT_FOUND);
    }
    const { sort, limit, page } = queries;
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.applicationRepository.findAndCount({
      where: {
        applicantId: findApplicant.id,
      },
      relations: {
        job: {
          company: true,
        },
      },
      select: {
        id: true,
        createdAt: true,
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
      message: 'get applied jobs successfully',
      result: {
        pagination,
        data: signedJobs,
      },
    };
  }
}
