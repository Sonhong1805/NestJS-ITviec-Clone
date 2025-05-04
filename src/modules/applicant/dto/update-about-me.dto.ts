import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAboutMeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aboutMe: string;
}
