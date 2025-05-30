import { ApplicantService } from './applicant.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { User } from 'src/databases/entities/user.entity';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePersonalInfomationDto } from './dto/update-personal-infomation.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { UpdateGeneralInfomationDto } from './dto/update-general-infomation.dto';
import { UpdateContactInfomationDto } from './dto/update-contact-infomation.dto';
import { UpdateAboutMeDto } from './dto/update-about-me.dto';
import { UpsertEducationDto } from './dto/upsert-education.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { UpsertExperienceDto } from './dto/upsert-experience.dto';
import { UpsertProjectDto } from './dto/upsert-project.dto';
import { UpsertCertificateDto } from './dto/upsert-certificate.dto';
import { UpsertAwardDto } from './dto/upsert-award.dto';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
@ApiBearerAuth()
@Controller('applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Roles(ROLE.APPLICANT)
  @Get('educations')
  getEducations(@GetUser() user: User) {
    return this.applicantService.getEducations(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('experiences')
  getExperiences(@GetUser() user: User) {
    return this.applicantService.getExperiences(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('projects')
  getProjects(@GetUser() user: User) {
    return this.applicantService.getProjects(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('certificates')
  getCertificates(@GetUser() user: User) {
    return this.applicantService.getCertificates(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('awards')
  getAwards(@GetUser() user: User) {
    return this.applicantService.getAwards(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('skills')
  getSkills(@GetUser() user: User) {
    return this.applicantService.getSkills(user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('saved-jobs')
  getSavedJobs(@Query() query: CommonQueryDto, @GetUser() user: User) {
    return this.applicantService.getSavedJobs(query, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('resent-viewed-jobs')
  getResentViewdJobs(@Query() query: CommonQueryDto, @GetUser() user: User) {
    return this.applicantService.getResentViewdJobs(query, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('applied-jobs')
  getAppliedJobs(@Query() query: CommonQueryDto, @GetUser() user: User) {
    return this.applicantService.getAppliedJobs(query, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get(':userId')
  getDetailByUser(@Param('userId') userId: number) {
    return this.applicantService.getDetailByUser(userId);
  }

  @Roles(ROLE.APPLICANT)
  @Put()
  update(@Body() body: UpdateApplicantDto, @GetUser() user: User) {
    return this.applicantService.update(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('upload/cv')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cv'))
  uploadCV(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    return this.applicantService.uploadCV(file, user);
  }

  @Roles(ROLE.APPLICANT)
  @Patch('personal')
  updatePeronalInfomation(
    @Body() body: UpdatePersonalInfomationDto,
    @GetUser() user: User,
  ) {
    return this.applicantService.updatePersonalInfomation(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Patch('general')
  updateGeneralInfomation(
    @Body() body: UpdateGeneralInfomationDto,
    @GetUser() user: User,
  ) {
    return this.applicantService.updateGeneralInfomation(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Patch('contact')
  @UseInterceptors(FileInterceptor('avatar'))
  updateContactInfomation(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateContactInfomationDto,
    @GetUser() user: User,
  ) {
    return this.applicantService.updateContactInfomation(file, body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Patch('cover-letter')
  updateCoverLetter(@Body() body: UpdateCoverLetterDto, @GetUser() user: User) {
    return this.applicantService.updateCoverLetter(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Patch('about-me')
  updateAboutMe(@Body() body: UpdateAboutMeDto, @GetUser() user: User) {
    return this.applicantService.updateAboutMe(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('education')
  createEducation(@Body() body: UpsertEducationDto, @GetUser() user: User) {
    return this.applicantService.createEducation(body, user);
  }

  @Public()
  @Put('education/:id')
  updateEducation(@Param('id') id: number, @Body() body: UpsertEducationDto) {
    return this.applicantService.updateEducation(id, body);
  }

  @Public()
  @Delete('education/:id')
  deleteEducation(@Param('id') id: number) {
    return this.applicantService.deleteEducation(id);
  }

  @Roles(ROLE.APPLICANT)
  @Post('experience')
  createExperience(@Body() body: UpsertExperienceDto, @GetUser() user: User) {
    return this.applicantService.createExperience(body, user);
  }

  @Public()
  @Put('experience/:id')
  updateExperience(@Param('id') id: number, @Body() body: UpsertExperienceDto) {
    return this.applicantService.updateExperience(id, body);
  }

  @Public()
  @Delete('experience/:id')
  deleteExperience(@Param('id') id: number) {
    return this.applicantService.deleteExperience(id);
  }

  @Roles(ROLE.APPLICANT)
  @Post('project')
  createProject(@Body() body: UpsertProjectDto, @GetUser() user: User) {
    return this.applicantService.createProject(body, user);
  }

  @Public()
  @Put('project/:id')
  updateProject(@Param('id') id: number, @Body() body: UpsertProjectDto) {
    return this.applicantService.updateProject(id, body);
  }

  @Public()
  @Delete('project/:id')
  deleteProject(@Param('id') id: number) {
    return this.applicantService.deleteProject(id);
  }

  @Roles(ROLE.APPLICANT)
  @Post('certificate')
  createCertificate(@Body() body: UpsertCertificateDto, @GetUser() user: User) {
    return this.applicantService.createCertificate(body, user);
  }

  @Public()
  @Put('certificate/:id')
  updateCertificate(
    @Param('id') id: number,
    @Body() body: UpsertCertificateDto,
  ) {
    return this.applicantService.updateCertificate(id, body);
  }

  @Public()
  @Delete('certificate/:id')
  deleteCertificate(@Param('id') id: number) {
    return this.applicantService.deleteCertificate(id);
  }

  @Roles(ROLE.APPLICANT)
  @Post('award')
  createAward(@Body() body: UpsertAwardDto, @GetUser() user: User) {
    return this.applicantService.createAward(body, user);
  }

  @Public()
  @Put('award/:id')
  updateAward(@Param('id') id: number, @Body() body: UpsertAwardDto) {
    return this.applicantService.updateAward(id, body);
  }

  @Public()
  @Delete('award/:id')
  deleteAward(@Param('id') id: number) {
    return this.applicantService.deleteAward(id);
  }

  @Roles(ROLE.APPLICANT)
  @Post('skills')
  createSkills(@Body() body: CreateSkillDto, @GetUser() user: User) {
    return this.applicantService.createSkills(body, user);
  }
}
