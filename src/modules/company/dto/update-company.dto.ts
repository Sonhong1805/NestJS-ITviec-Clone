import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  COMPANY_ADDRESS,
  COMPANY_COUNTRY,
  COMPANY_SIZE,
  COMPANY_TYPE,
  OVERTIME_POLICY,
  WORKING_DAY,
} from 'src/commons/enums/company.enum';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'developer' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  industryId: number;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  website: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  overview: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  perks: string;

  @ApiProperty({
    example: COMPANY_ADDRESS.DA_NANG,
    enum: COMPANY_ADDRESS,
  })
  @IsEnum(COMPANY_ADDRESS)
  @IsNotEmpty()
  location: COMPANY_ADDRESS;

  @ApiProperty({
    example: COMPANY_COUNTRY.VIET_NAM,
    enum: COMPANY_COUNTRY,
  })
  @IsEnum(COMPANY_COUNTRY)
  @IsNotEmpty()
  country: COMPANY_COUNTRY;

  @ApiProperty({
    example: COMPANY_SIZE.ENTERPRISE,
    enum: COMPANY_SIZE,
  })
  @IsEnum(COMPANY_SIZE)
  @IsNotEmpty()
  companySize: string;

  @ApiProperty({
    example: COMPANY_TYPE.HEADHUNT,
    enum: COMPANY_TYPE,
  })
  @IsEnum(COMPANY_TYPE)
  @IsNotEmpty()
  companyType: COMPANY_TYPE;

  @ApiProperty({
    example: WORKING_DAY.NORMAL,
    enum: WORKING_DAY,
  })
  @IsEnum(WORKING_DAY)
  @IsNotEmpty()
  workingDay: WORKING_DAY;

  @ApiProperty({
    example: OVERTIME_POLICY.NO_OT,
    enum: OVERTIME_POLICY,
  })
  @IsEnum(OVERTIME_POLICY)
  @IsNotEmpty()
  overtimePolicy: OVERTIME_POLICY;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    (Array.isArray(value)
      ? value.map((item) => Number(item))
      : [Number(value)]
    ).filter(Boolean),
  )
  skillIds: number[];
}
