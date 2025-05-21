import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { APPLICANT_LEVEL, CURRENCY_SALARY } from 'src/commons/enums/job.enum';

export class AllJobQueriesDto extends CommonQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean),
  )
  status: string[];

  @ApiProperty({
    example: [APPLICANT_LEVEL.FRESHER],
    enum: APPLICANT_LEVEL,
    required: false,
    isArray: true,
  })
  @IsEnum(APPLICANT_LEVEL, { each: true })
  @IsOptional()
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean),
  )
  levels: APPLICANT_LEVEL[];

  @ApiProperty({
    example: [CURRENCY_SALARY.USD],
    enum: CURRENCY_SALARY,
    required: false,
    isArray: true,
  })
  @IsEnum(CURRENCY_SALARY, { each: true })
  @IsOptional()
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean),
  )
  currencies: CURRENCY_SALARY[];
}
