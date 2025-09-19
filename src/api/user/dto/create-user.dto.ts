import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali Valiev' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'alivaliev@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'AliV1234!' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
