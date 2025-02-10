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
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { Public } from 'src/commons/decorators/public.decorator';
import { IndustryService } from './industry.service';
import { IndustryQueriesDto } from './dto/industry-query.dto';

@ApiBearerAuth()
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Roles(ROLE.ADMIN)
  @Post()
  create(@Body() body: UpsertIndustryDto) {
    return this.industryService.create(body);
  }

  @Roles(ROLE.ADMIN)
  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpsertIndustryDto) {
    return this.industryService.update(id, body);
  }

  @Public()
  @Get(':id')
  getDetail(@Param('id') id: number) {
    return this.industryService.getDetail(id);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.industryService.delete(id);
  }

  @Public()
  @Get('')
  getAll(@Query() queries: IndustryQueriesDto) {
    return this.industryService.getAll(queries);
  }
}
