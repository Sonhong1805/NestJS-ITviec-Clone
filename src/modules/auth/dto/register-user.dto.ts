import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/decorators/is-strong-password.decorator';

export class RegisterUserDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'user123' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
