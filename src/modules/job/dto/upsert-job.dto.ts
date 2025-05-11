import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMPANY_ADDRESS } from 'src/commons/enums/company.enum';
import {
  APPLICANT_LEVEL,
  CURRENCY_SALARY,
  JOB_LABEL,
  WORKING_MODEL,
} from 'src/commons/enums/job.enum';

export class UpsertJobDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({
    example: JOB_LABEL.HOT,
    enum: JOB_LABEL,
  })
  // @IsEnum(JOB_LABEL)
  @IsOptional()
  label: JOB_LABEL;

  @ApiProperty({
    example: WORKING_MODEL.AT_OFFICE,
    enum: WORKING_MODEL,
  })
  @IsEnum(WORKING_MODEL)
  @IsNotEmpty()
  workingModel: WORKING_MODEL;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  requirement: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reason: string;

  @ApiProperty({
    example: COMPANY_ADDRESS.HA_NOI,
    enum: COMPANY_ADDRESS,
  })
  @IsEnum(COMPANY_ADDRESS)
  @IsNotEmpty()
  location: COMPANY_ADDRESS;

  @ApiProperty({
    example: APPLICANT_LEVEL.FRESHER,
    enum: APPLICANT_LEVEL,
  })
  @IsEnum(APPLICANT_LEVEL)
  @IsNotEmpty()
  level: APPLICANT_LEVEL;

  @ApiProperty()
  @IsNumber({}, { each: true })
  @IsOptional()
  skillIds: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  minSalary: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxSalary: number;

  @ApiProperty({
    example: CURRENCY_SALARY.USD,
    enum: CURRENCY_SALARY,
  })
  @IsEnum(CURRENCY_SALARY)
  @IsOptional()
  currencySalary: CURRENCY_SALARY;

  @ApiProperty({ type: String, format: 'date', required: false })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return value instanceof Date ? value : new Date(value);
  })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date', required: false })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return value instanceof Date ? value : new Date(value);
  })
  endDate: Date;
}
