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
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { Public } from 'src/commons/decorators/public.decorator';
import { UpsertUserDto } from './dto/upsert-user.dto';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: UpsertUserDto) {}

  @Roles(ROLE.ADMIN)
  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpsertUserDto) {
    return this.userService.update(id, body);
  }

  @Public()
  @Get(':id')
  getDetail(@Param('id') id: number) {
    return this.userService.getDetail(id);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
