import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class IndustryQueriesDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name: string;
}
