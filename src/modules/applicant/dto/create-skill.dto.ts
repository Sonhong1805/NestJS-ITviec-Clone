import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { SKILL_LEVEL } from 'src/commons/enums/job.enum';

export class SkillItemDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  skillId: number;

  @ApiProperty({
    required: true,
    example: SKILL_LEVEL.BEGINNER,
    enum: SKILL_LEVEL,
  })
  @IsEnum(SKILL_LEVEL)
  @IsOptional()
  level: SKILL_LEVEL;
}

export class CreateSkillDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills: SkillItemDto[];
}
