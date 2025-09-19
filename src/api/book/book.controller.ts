import { Body, Controller, Get, Param, Post, Delete, UseGuards, ParseUUIDPipe, Patch, Query, BadRequestException } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBookDto } from './dto/update-book.dto';
import { ILike } from 'typeorm';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN)
  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateBookDto) {
    const {published_year} = dto;
    if (published_year && (1500 < published_year && published_year < new Date().getFullYear())) {
    return this.bookService.create(dto);
    }else {
      throw new BadRequestException('Published_year between 1500 and present time')
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN)
  @Get('StatistikaUser')
  @ApiBearerAuth()
  statistikaUser() {
    return this.bookService.statistikaUser()
  }

  @Get('StatistikaBook')
  statistikaBook() {
    return this.bookService.statistikaBook()
  }

  @Get('All')
  findAll(@Query() bookQuery: UpdateBookDto) {
    const { title, author, published_year, available } = bookQuery;
    const where: any = {};

    if (title) where.title = ILike( `%${title}%`);
    if (author) where.author = ILike( `%${author}%`);
    if (available !== undefined) where.available = available;
    if (published_year) {
      if (1500 < published_year && published_year < new Date().getFullYear()) {
        where.published_year = published_year;
      }else {
      throw new BadRequestException('Published_year between 1500 and present time')
      }
    }
    return this.bookService.findAll({
      where,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.findOneById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN)
  @Get('bookHistory/:id')
  @ApiBearerAuth()
  bookHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.bookHistory(id)
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN, 'ID')
  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookDto) {
    const {published_year} = dto;
    if (published_year) {
      if (1500 < published_year && published_year < new Date().getFullYear()) {
        return this.bookService.update(id, dto);
      }else {
      throw new BadRequestException('Published_year between 1500 and present time')
      }
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN, 'ID')
  @Delete(':id')
  @ApiBearerAuth()
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.delete(id);
  }
}
