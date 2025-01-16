import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class LoginGoogleDto {
  @ApiProperty({ example: 'ey...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
