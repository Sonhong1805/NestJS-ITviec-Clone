import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class ForgotPasswordDto {
  @ApiProperty({ example: 'son@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsOptional()
  isCompany: boolean;
}
