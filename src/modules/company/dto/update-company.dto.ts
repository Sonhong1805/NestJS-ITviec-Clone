import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  COMPANY_ADDRESS,
  COMPANY_SIZE,
  COMPANY_TYPE,
} from 'src/commons/enums/company.enum';

export class UpdateCompanyDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  industryId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  website: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logo: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  codeTax: string;

  @ApiProperty({
    example: COMPANY_ADDRESS.DA_NANG,
    enum: COMPANY_ADDRESS,
  })
  @IsEnum(COMPANY_ADDRESS)
  @IsOptional()
  location: COMPANY_ADDRESS;

  @ApiProperty({
    example: COMPANY_SIZE.ENTERPRISE,
    enum: COMPANY_SIZE,
  })
  @IsEnum(COMPANY_SIZE)
  @IsOptional()
  companySize: string;

  @ApiProperty({
    example: COMPANY_TYPE.HEADHUNT,
    enum: COMPANY_TYPE,
  })
  @IsEnum(COMPANY_TYPE)
  @IsOptional()
  companyType: COMPANY_TYPE;

  @ApiProperty()
  @IsString()
  @IsOptional()
  workingDay: string;
}
