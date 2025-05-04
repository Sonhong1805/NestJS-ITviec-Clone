import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertProjectDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsOptional()
  isWorkingOnProject: boolean;

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
  description: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  url: string;
}
