import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  applicantId: number;
}
