import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertIndustryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
