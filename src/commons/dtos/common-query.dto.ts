import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants/common';
import { convertStringSortToObject } from '../utils/helper';

export class CommonQueryDto {
  @ApiProperty({ example: DEFAULT_PAGE, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = DEFAULT_PAGE;

  @ApiProperty({ example: DEFAULT_LIMIT, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number = DEFAULT_LIMIT;

  @ApiProperty({ example: 'id:ASC,name:DESC', required: false, type: 'string' })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return convertStringSortToObject(value);
    }
    return value;
  })
  sort?: FindOptionsOrderSimple;
}
