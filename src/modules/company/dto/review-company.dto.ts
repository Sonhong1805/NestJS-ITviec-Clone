import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewCompanyDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  companyId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rate: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  review: string;
}
