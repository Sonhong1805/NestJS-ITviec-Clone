import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants/common';

export class CommonQueryDto {
  @ApiProperty({ example: DEFAULT_PAGE, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = DEFAULT_PAGE;

  @ApiProperty({ example: DEFAULT_LIMIT, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number = DEFAULT_LIMIT;
}
