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
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyService } from './company.service';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { ReviewCompanyDto } from './dto/review-company.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { CompanyReviewQueryDto } from './dto/company-review-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyQueriesDto } from './dto/company-queries.dto';
import { AllCVQueriesDto } from './dto/all-cv-queries.dto';
import { AllReviewQueriesDto } from './dto/all-review-queries.dto';
import { ChangeStatusReviewDto } from './dto/change-status-review.dto';
import { AllJobQueriesDto } from './dto/all-job-queries.dto';

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles(ROLE.COMPANY)
  @Get('dashboard')
  dashboard(@GetUser() user: User) {
    return this.companyService.dashboard(user);
  }

  @Roles(ROLE.COMPANY)
  @Get('all-job')
  getAllJob(@Query() queries: AllJobQueriesDto, @GetUser() user: User) {
    return this.companyService.getAllJob(queries, user);
  }

  @Roles(ROLE.COMPANY)
  @Get('all-cv')
  getAllCV(@Query() queries: AllCVQueriesDto, @GetUser() user: User) {
    return this.companyService.getAllCV(queries, user);
  }

  @Roles(ROLE.COMPANY)
  @Get('all-review')
  getAllReview(@Query() queries: AllReviewQueriesDto, @GetUser() user: User) {
    return this.companyService.getAllReview(queries, user);
  }

  @Public()
  @Get(':param')
  async getDetail(
    @Param('param') param: string | number,
    @GetUser() user: User,
  ) {
    return this.companyService.getDetail(param, user);
  }

  @Public()
  @Get('')
  async getAll(@Query() queries: CompanyQueriesDto) {
    return this.companyService.getAll(queries);
  }

  @Roles(ROLE.COMPANY)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
    @Body() body: UpdateCompanyDto,
    @GetUser() user: User,
  ) {
    return this.companyService.update(id, file, body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('review/:id')
  createReview(
    @Param('id') id: number,
    @Body() body: ReviewCompanyDto,
    @GetUser() user: User,
  ) {
    return this.companyService.createReview(id, body, user);
  }

  @Public()
  @Get('review/:id')
  getReviews(@Param('id') id: number, @Query() queries: CompanyReviewQueryDto) {
    return this.companyService.getReviews(id, queries);
  }

  @Roles(ROLE.APPLICANT)
  @Post('follow/:id')
  follow(@Param('id') id: number, @GetUser() user: User) {
    return this.companyService.follow(id, user);
  }

  @Roles(ROLE.COMPANY)
  @Delete('review/:id')
  deleteReview(@Param('id') id: number) {
    return this.companyService.deleteReview(id);
  }

  @Roles(ROLE.COMPANY)
  @Patch('review/:id/status')
  changeStatusReview(
    @Param('id') id: number,
    @Body() body: ChangeStatusReviewDto,
  ) {
    return this.companyService.changeStatusReview(id, body);
  }
}
