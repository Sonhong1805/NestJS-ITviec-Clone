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
import { ManuscriptService } from './manuscript.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { UpsertManuscriptDto } from './dto/upsert-manuscript.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ManuscriptQueriesDto } from './dto/manuscript-queries.dto';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';

@ApiBearerAuth()
@Controller('manuscript')
export class ManuscriptController {
  constructor(private readonly manuscriptService: ManuscriptService) {}

  @Roles(ROLE.COMPANY)
  @Post()
  create(@Body() body: UpsertManuscriptDto, @GetCurrentUser() user: User) {
    return this.manuscriptService.create(body, user);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: UpsertManuscriptDto,
    @GetCurrentUser() user: User,
  ) {
    return this.manuscriptService.update(id, body, user);
  }

  @Public()
  @Get(':id')
  getDetail(@Param('id') id: number, @GetCurrentUser() user: User) {
    return this.manuscriptService.getDetail(id, user);
  }

  @Roles(ROLE.COMPANY)
  @Delete(':id')
  delete(@Param('id') id: number, @GetCurrentUser() user: User) {
    return this.manuscriptService.delete(id, user);
  }

  @Public()
  @Get('')
  getAll(@Query('') queries: ManuscriptQueriesDto) {
    return this.manuscriptService.getAll(queries);
  }

  @Roles(ROLE.APPLICANT)
  @Get('viewed')
  getAllByViewed(
    @Query('') queries: CommonQueryDto,
    @GetCurrentUser() user: User,
  ) {
    return this.manuscriptService.getAllByViewed(queries, user);
  }

  @Roles(ROLE.APPLICANT)
  @Get('favorite')
  getAllByFavorite(
    @Query() queries: CommonQueryDto,
    @GetCurrentUser() user: User,
  ) {
    return this.manuscriptService.getAllByFavorite(queries, user);
  }

  @Roles(ROLE.APPLICANT)
  @Post('favorite/:id')
  favorite(@Param('id') id: number, @GetCurrentUser() user: User) {
    return this.manuscriptService.favorite(id, user);
  }
}
