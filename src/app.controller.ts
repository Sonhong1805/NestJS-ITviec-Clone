import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './commons/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Post('search')
  searchByKeyword(@Query('keyword') keyword: string) {
    return this.appService.searchByKeyword(keyword);
  }
}
