import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompanyQueriesDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;
}
