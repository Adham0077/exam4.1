import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from 'src/core/entity/borrow.entity';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/book-history.entity';
import { User } from 'src/core/entity/user.entity';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, Book, BookHistory, User])],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
