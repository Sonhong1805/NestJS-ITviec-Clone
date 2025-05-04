import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { APPLICANT_LEVEL, CURRENCY_SALARY } from 'src/commons/enums/job.enum';

export class UpdateGeneralInfomationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  totalYears: string;

  @ApiProperty({
    required: true,
    example: APPLICANT_LEVEL.FRESHER,
    enum: APPLICANT_LEVEL,
  })
  @IsEnum(APPLICANT_LEVEL)
  @IsNotEmpty()
  currentLevel: APPLICANT_LEVEL;

  @ApiProperty({
    required: true,
    example: CURRENCY_SALARY.VND,
    enum: CURRENCY_SALARY,
  })
  @IsEnum(CURRENCY_SALARY)
  @IsNotEmpty()
  expectedSalaryCurrency: CURRENCY_SALARY;

  @ApiProperty({
    required: true,
    example: CURRENCY_SALARY.VND,
    enum: CURRENCY_SALARY,
  })
  @IsEnum(CURRENCY_SALARY)
  @IsNotEmpty()
  currentSalaryCurrency: CURRENCY_SALARY;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  salaryFrom: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsNotEmpty()
  salaryTo: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  currentSalary: number;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value.map((item) => item) : [value]).filter(
      Boolean,
    ),
  )
  expectedWorkingModels: string[];

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value.map((item) => +item) : [+value]).filter(
      Boolean,
    ),
  )
  industryExperiences: number[];
}
