import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  preferWorkLocation: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  resume: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  coverLetter: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  manuscriptId: number;
}
