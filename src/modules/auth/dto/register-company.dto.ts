import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { COMPANY_ADDRESS } from 'src/commons/enums/company.enum';
import { IsStrongPassword } from 'src/commons/decorators/is-strong-password.decorator';

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

  @ApiProperty({ example: 'User123456789' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

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
  @IsNotEmpty()
  companyWebsite: string;
}
