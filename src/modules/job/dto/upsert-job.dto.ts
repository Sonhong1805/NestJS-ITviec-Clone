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
    example: WORKING_MODEL.AT_OFFICE,
    enum: WORKING_MODEL,
  })
  @IsEnum(WORKING_MODEL)
  @IsOptional()
  workingModel: WORKING_MODEL;

  @ApiProperty()
  @IsString()
  @IsOptional()
  descriptions: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  requirement: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({
    example: COMPANY_ADDRESS.HA_NOI,
    enum: COMPANY_ADDRESS,
  })
  @IsEnum(COMPANY_ADDRESS)
  @IsOptional()
  location: COMPANY_ADDRESS;

  @ApiProperty({
    example: APPLICANT_LEVEL.FRESHER,
    enum: APPLICANT_LEVEL,
  })
  @IsEnum(APPLICANT_LEVEL)
  @IsOptional()
  level: APPLICANT_LEVEL;

  @ApiProperty()
  @IsNumber({}, { each: true })
  @IsOptional()
  skillIds: number[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minSalary: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxSalary: number;

  @ApiProperty({
    example: CURRENCY_SALARY.USD,
    enum: CURRENCY_SALARY,
  })
  @IsEnum(CURRENCY_SALARY)
  @IsOptional()
  currencySalary: CURRENCY_SALARY;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endDate: Date;
}
