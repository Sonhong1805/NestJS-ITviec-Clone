import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Roles(ROLE.APPLICANT)
  @Post(':slug')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cv'))
  create(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateApplicationDto,
    @GetUser() user: User,
  ) {
    return this.applicationService.create(slug, file, body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('job-status')
  getJobStatus(@Query() queries: CommonQueryDto, @GetUser() user: User) {
    return this.applicationService.getJobStatus(queries, user);
  }
}
