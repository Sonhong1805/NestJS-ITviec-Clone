import { ApplicantService } from './applicant.service';
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
import { GetUser } from 'src/commons/decorators/get-current-user.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { User } from 'src/databases/entities/user.entity';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpsertApplicantSkillDto } from './dto/upsert-applicant-skill.dto';
@ApiBearerAuth()
@Controller('applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Roles(ROLE.APPLICANT)
  @Put()
  update(@Body() body: UpdateApplicantDto, @GetUser() user: User) {
    return this.applicantService.update(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('skill/:id')
  createSkill(@Body() body: UpsertApplicantSkillDto, @GetUser() user: User) {
    return this.applicantService.createSkill(body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Put('skill/:id')
  updateSkill(
    @Param('id') id: number,
    @Body() body: UpsertApplicantSkillDto,
    @GetUser() user: User,
  ) {
    return this.applicantService.updateSkill(id, body, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('skills')
  getSkills(@GetUser() user: User) {
    return this.applicantService.getSkills(user);
  }
}
