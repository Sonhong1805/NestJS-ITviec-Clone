import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMPANY_ADDRESS } from 'src/commons/enums/company.enum';

export class RegisterCompanyDto {
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

  @ApiProperty({ example: '01235456876' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Panasonic' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: COMPANY_ADDRESS.HA_NOI })
  @IsEnum(COMPANY_ADDRESS)
  @IsString()
  @IsNotEmpty()
  companyAddress: COMPANY_ADDRESS;

  @ApiProperty({ example: 'http//...' })
  @IsString()
  @IsOptional()
  companyWebsite: string;
}
