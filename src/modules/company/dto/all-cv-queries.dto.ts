import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';

export class AllCVQueriesDto extends CommonQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean),
  )
  status: string[] | string;
}
