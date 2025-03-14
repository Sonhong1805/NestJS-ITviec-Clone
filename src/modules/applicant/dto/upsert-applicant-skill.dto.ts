import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { APPLICANT_LEVEL } from 'src/commons/enums/job.enum';

export class UpsertApplicantSkillDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  skillId: number;

  @ApiProperty({
    required: true,
    example: APPLICANT_LEVEL.FRESHER,
    enum: APPLICANT_LEVEL,
  })
  @IsEnum(APPLICANT_LEVEL)
  @IsOptional()
  level: APPLICANT_LEVEL;
}
