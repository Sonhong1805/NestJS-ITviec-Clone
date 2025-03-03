import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyService } from './company.service';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { ReviewCompanyDto } from './dto/review-company.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { CompanyReviewQueryDto } from './dto/company-review-query.dto';

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles(ROLE.COMPANY)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: UpdateCompanyDto,
    @GetCurrentUser() user: User,
  ) {
    return this.companyService.update(id, body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post(':id')
  createReview(@Body() body: ReviewCompanyDto, @GetCurrentUser() user: User) {
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
