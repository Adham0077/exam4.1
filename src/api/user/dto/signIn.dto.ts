import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
} from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'adham011905@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Adham123!' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
