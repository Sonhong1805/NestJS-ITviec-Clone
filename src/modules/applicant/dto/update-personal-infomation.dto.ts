import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePersonalInfomationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value.map((item) => item) : [value]).filter(
      Boolean,
    ),
  )
  locations: string[];
}
