import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateApplicantDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  summary: string;
}
