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

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Get(':param')
  async getDetail(@Param('param') param: string | number) {
    return this.companyService.getDetail(param);
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
  @Post(':id')
  createReview(@Body() body: ReviewCompanyDto, @GetUser() user: User) {
    return this.companyService.createReview(body, user);
  }

  @Public()
  @Get('review/:companyId')
  getReview(
    @Param('companyId') companyId: number,
    @Query() queries: CompanyReviewQueryDto,
  ) {
    return this.companyService.getReview(companyId, queries);
  }
}
