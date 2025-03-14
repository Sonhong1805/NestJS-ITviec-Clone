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
import { Public } from 'src/commons/decorators/public.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Roles(ROLE.APPLICANT)
  @Post()
  create(@Body() body: CreateApplicationDto, @GetUser() user: User) {
    return this.applicationService.create(body, user);
  }

  @Roles(ROLE.COMPANY)
  @Get('job/:jobId')
  getAllByjob(@Param('jobId') jobId: number, @GetUser() user: User) {
    return this.applicationService.getAllByJob(jobId, user);
  }
}
