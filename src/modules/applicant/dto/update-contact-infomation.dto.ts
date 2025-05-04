import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GENDER } from 'src/commons/enums/user.enum';

export class UpdateContactInfomationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dob: Date;

  @ApiProperty({
    required: false,
    example: GENDER.MALE,
    enum: GENDER,
  })
  @IsEnum(GENDER)
  @IsOptional()
  gender: GENDER;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  link: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar: string;
}
