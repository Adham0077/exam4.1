import { Injectable, HttpException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Borrow } from 'src/core/entity/borrow.entity';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/book-history.entity';
import { User } from 'src/core/entity/user.entity';
import { Actions } from 'src/common/enum';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow) private borrowRepo: Repository<Borrow>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(BookHistory) private historyRepo: Repository<BookHistory>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async borrowBook(bookId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['borrows'],
      });
      if (!user) throw new NotFoundException('User not found');

      const book = await manager.findOne(Book, { where: { id: bookId } });
      if (!book || !book.available){
        throw new BadRequestException('Book not found or not available');
      }
      if (user.borrows.length >= 3){
        throw new BadRequestException('Max 3 books allowed');
      }
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const borrow = manager.create(Borrow, {
        userId: user,
        bookId: book,
        borrow_date: new Date(),
        due_date: dueDate,
        overdue: false,
      });
      await manager.save(borrow);

      book.available = false;
      await manager.save(book);

      const history = manager.create(BookHistory, {
        bookId: book,
        userId: user,
        action: Actions.BORROW,
        date: new Date(),
      });
      await manager.save(history);

      return borrow;
    });
  }

  async returnBook(borrowId: string) {
    return this.dataSource.transaction(async (manager) => {
      const borrow = await manager.findOne(Borrow, {
        where: { id: borrowId },
        relations: ['bookId', 'userId'],
      });
      if (!borrow) throw new NotFoundException('Borrow not found');

      borrow.return_date = new Date();
      if (borrow.return_date > borrow.due_date) borrow.overdue = true;
      await manager.save(borrow);

      borrow.bookId.available = true;
      await manager.save(borrow.bookId);

      const history = manager.create(BookHistory, {
        bookId: borrow.bookId,
        userId: borrow.userId,
        action: Actions.RETURN,
        date: new Date(),
      });
      await manager.save(history);

      return borrow;
    });
  }

  async myBorrows(userId: string) {
    return this.borrowRepo.find({
      where: { userId: { id: userId } },
      relations: ['bookId'],
    });
  }
}
