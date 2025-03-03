import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CompanyReviewQueryDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cursor: number;
}
