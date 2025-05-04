import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertCertificateDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  organization: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  url: string;
}
