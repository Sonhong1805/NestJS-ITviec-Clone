import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCoverLetterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverLetter: string;
}
