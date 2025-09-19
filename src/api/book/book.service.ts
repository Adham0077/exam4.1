import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/core/entity/book.entity';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Repository } from 'typeorm';
import { successRes } from 'src/infrastructure/response/success';

@Injectable()
export class BookService extends BaseService<
  CreateBookDto,
  UpdateBookDto,
  Book> {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {
    super(bookRepo);
  }

  async statistikaBook() {
    const data = await this.bookRepo
      .createQueryBuilder("book")
      .leftJoin("book.bookHistory", "history")
      .select("book.id", "bookId")
      .addSelect("book.title", "title")
      .addSelect("COUNT(history.id)", "buyurtma_soni")
      .groupBy("book.id")
      .addGroupBy("book.title")
      .orderBy("COUNT(history.id)", "DESC")
      .limit(5)
      .getRawMany();

    return successRes(data);
  }

  async statistikaUser() {
    const data = await this.bookRepo
      .createQueryBuilder("book")
      .leftJoin("book.bookHistory", "history")
      .leftJoin("history.userId", "user")
      .select("user.id", "userId")
      .addSelect("user.full_name", "full_name")
      .addSelect('user.email', 'email')
      .addSelect("COUNT(history.id)", "buyurtma_soni")
      .groupBy("user.id")
      .addGroupBy("user.full_name")
      .addGroupBy("user.email")
      .orderBy("COUNT(history.id)", "DESC")
      .limit(5)
      .getRawMany();

    return successRes(data);
  }

  async bookHistory(id: string) {
    const data = await this.bookRepo.findOne({ where: { id }, relations: { bookHistory: true } })
    if (!data) {
      throw new NotFoundException('Book not fount')
    }
    if(!data.bookHistory.length) {
      throw new NotFoundException('History not fount')
    }
    return successRes(data);
  }

}
