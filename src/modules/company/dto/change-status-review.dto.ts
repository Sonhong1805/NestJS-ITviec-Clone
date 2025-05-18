import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CommonQueryDto } from 'src/commons/dtos/common-query.dto';
import { STATUS_REVIEW } from 'src/commons/enums/company.enum';

export class ChangeStatusReviewDto extends CommonQueryDto {
  @ApiProperty({
    example: STATUS_REVIEW.SHOW,
    enum: STATUS_REVIEW,
    required: false,
  })
  @IsEnum(STATUS_REVIEW)
  @IsNotEmpty()
  status: STATUS_REVIEW;
}
