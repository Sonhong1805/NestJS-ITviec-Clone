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
import { JobService } from './job.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { UpsertJobDto } from './dto/upsert-job.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JobQueriesDto } from './dto/job-queries.dto';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';

@ApiBearerAuth()
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Roles(ROLE.COMPANY)
  @Post()
  create(@Body() body: UpsertJobDto, @GetUser() user: User) {
    return this.jobService.create(body, user);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: UpsertJobDto,
    @GetUser() user: User,
  ) {
    return this.jobService.update(id, body, user);
  }

  @Public()
  @Get('quantity')
  getQuantity() {
    return this.jobService.getQuantity();
  }

  @Public()
  @Get(':slug')
  getDetail(@Param('slug') slug: string, @GetUser() user: User) {
    return this.jobService.getDetail(slug, user);
  }

  @Roles(ROLE.COMPANY)
  @Delete(':id')
  delete(@Param('id') id: number, @GetUser() user: User) {
    return this.jobService.delete(id, user);
  }

  @Public()
  @Get('')
  getAll(@Query('') queries: JobQueriesDto, @GetUser() user: User) {
    return this.jobService.getAll(queries, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('wishlist/:jobId')
  wishlist(@Param('jobId') jobId: number, @GetUser() user: User) {
    return this.jobService.wishlist(jobId, user);
  }
}
