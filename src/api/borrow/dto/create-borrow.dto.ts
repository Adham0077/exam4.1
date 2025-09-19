import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  bookId: string;
}
