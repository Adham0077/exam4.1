import { BaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('borrow')
export class Borrow extends BaseEntity {
  @ManyToOne(() => Book, (book) => book.borrows)
  bookId: Book;

  @ManyToOne(() => User, (user) => user.borrows)
  userId: User;

  @Column({ type: 'timestamp' })
  borrow_date: Date;

  @Column({
    type: 'timestamp',
  })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  return_date: Date;

  @Column({ type: 'boolean' })
  overdue: boolean;
}
