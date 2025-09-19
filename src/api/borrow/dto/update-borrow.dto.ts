import { PartialType } from '@nestjs/mapped-types';
import { CreateBorrowDto } from './create-borrow.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBorrowDto extends PartialType(CreateBorrowDto) {
  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsOptional()
  overdue: boolean;
}
