import { BaseEntity } from 'src/common/database/base.entity';
import { Actions } from 'src/common/enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('bookHistory')
export class BookHistory extends BaseEntity {
  @ManyToOne(() => Book, (book) => book.bookHistory, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  bookId: Book;

  @ManyToOne(() => User, (user) => user.bookHistory, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userId: User;

  @Column({ type: 'enum', enum: Actions, default: Actions.BORROW })
  action: Actions;

  @Column({ type: 'timestamp' })
  date: Date;
}
