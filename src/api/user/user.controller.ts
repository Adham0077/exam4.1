import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CookieGetter } from 'src/common/decorator/cookie-getter.decorator';
import { GetRequestUser } from 'src/common/decorator/get-request-user.decorator';

import { Roles } from 'src/common/enum';
import type { IToken } from 'src/infrastructure/token/interface';

import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { SignInDto } from './dto/signIn.dto';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { In } from 'typeorm';
import { config } from 'src/config';

@ApiTags('User')
@Controller('admin')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN)
  @Post('admin')
  @ApiBearerAuth()
  createAdmin(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.ADMIN);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN)
  @Post('librarian')
  @ApiBearerAuth()
  createLibrarian(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.LIBRARIAN);
  }

  @Post('reader')
  signUp(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.READER);
  }

  @Post('signin')
  signin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  @Post('token')
  newToken(@CookieGetter(config.TOKEN.REFRESH_KEY) token: string) {
    return this.authService.newToken(this.userService.getRepository, token);
  }

  @Post('signout')
  signOut(
    @CookieGetter(config.TOKEN.REFRESH_KEY) token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(
      this.userService.getRepository,
      token,
      res,
      config.TOKEN.REFRESH_KEY,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN)
  @Get('all')
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAll({
      relations: { bookHistory: true, borrows: true },
      where: {
        role: In([Roles.ADMIN, Roles.LIBRARIAN, Roles.READER])
      },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
      },
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN)
  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneById(id, {
      relations: { bookHistory: true, borrows: true },
      where: {
        role: In([Roles.ADMIN, Roles.LIBRARIAN, Roles.READER])
      },
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, 'ID')
  @Patch(':id')
  @ApiBearerAuth()
  update(
    @GetRequestUser('user') user: IToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, UpdateUserDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, 'ID')
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.getRepository.findOne({
      where: { id },
    });
    if (user && user.role === Roles.SUPERADMIN) {
      throw new ForbiddenException('Deleting super admin is restricted');
    }
    return this.userService.delete(id);
  }
}
