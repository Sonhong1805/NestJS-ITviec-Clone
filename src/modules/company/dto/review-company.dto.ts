import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { OVERTIME_POLICY_SATISFACTION } from 'src/commons/enums/company.enum';

export class ReviewCompanyDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({
    example: OVERTIME_POLICY_SATISFACTION.SATISFIED,
    enum: OVERTIME_POLICY_SATISFACTION,
  })
  @IsEnum(OVERTIME_POLICY_SATISFACTION)
  @IsNotEmpty()
  overtimePolicySatisfaction: OVERTIME_POLICY_SATISFACTION;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(140)
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  experiences: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  suggestion: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  salaryBenefits: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  trainingLearning: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  managementCare: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  cultureFun: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  officeWorkspace: number;

  @ApiProperty()
  @IsBoolean()
  isRecommend: boolean;
}
