import {
  Body,
  Controller,
  Get,
  Param,
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

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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
  getReview(@Param('id') id: number, @Query() queries: CompanyReviewQueryDto) {
    return this.companyService.getReview(id, queries);
  }

  @Roles(ROLE.APPLICANT)
  @Post('follow/:id')
  follow(@Param('id') id: number, @GetUser() user: User) {
    return this.companyService.follow(id, user);
  }
}
