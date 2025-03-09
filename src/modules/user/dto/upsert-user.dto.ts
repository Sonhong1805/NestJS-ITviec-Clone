import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';

export class UpsertUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: LOGIN_TYPE.EMAIL,
    enum: LOGIN_TYPE,
  })
  @IsEnum(LOGIN_TYPE)
  @IsNotEmpty()
  email: LOGIN_TYPE.EMAIL;

  @ApiProperty({
    example: ROLE.APPLICANT,
    enum: ROLE,
  })
  @IsEnum(ROLE)
  @IsNotEmpty()
  role: ROLE.APPLICANT;
}
