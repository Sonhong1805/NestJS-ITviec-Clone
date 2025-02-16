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
  getDetail(@Param('id') id: number) {
    return this.manuscriptService.getDetail(id);
  }

  @Roles(ROLE.COMPANY)
  @Delete(':id')
  delete(@Param('id') id: number, @GetCurrentUser() user: User) {
    return this.manuscriptService.delete(id, user);
  }

  @Public()
  @Get('')
  getAll(@Query() queries: any) {
    return this.manuscriptService.getAll(queries);
  }
}
