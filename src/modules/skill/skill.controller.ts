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
import { SkillService } from './skill.service';
import { UpsertSkillDto } from './dto/upsert-skill.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { Public } from 'src/commons/decorators/public.decorator';
import { SkillQueriesDto } from './dto/skill-query.dto';

@ApiBearerAuth()
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Roles(ROLE.ADMIN)
  @Post()
  create(@Body() body: UpsertSkillDto) {
    return this.skillService.create(body);
  }

  @Roles(ROLE.ADMIN)
  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpsertSkillDto) {
    return this.skillService.update(id, body);
  }

  @Public()
  @Get(':id')
  getDetail(@Param('id') id: number) {
    return this.skillService.getDetail(id);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.skillService.delete(id);
  }

  @Public()
  @Get('')
  getAll(@Query() queries: SkillQueriesDto) {
    return this.skillService.getAll(queries);
  }
}
