import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertEducationDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  school: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsOptional()
  isCurrentStudy: boolean;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  fromMonth: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  fromYear: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  toMonth: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  toYear: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  additionalDetails: string;
}
