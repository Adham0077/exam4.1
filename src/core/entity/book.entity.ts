import { BaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BookHistory } from './book-history.entity';
import { Borrow } from './borrow.entity';

@Entity('book')
export class Book extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  author: string;

  @Column({ type: 'int' })
  published_year: string;

  @Column({ type: 'boolean' })
  available: boolean;

  @OneToMany(() => BookHistory, (history) => history.bookId)
  bookHistory: BookHistory[];

  @OneToMany(() => Borrow, (borrow) => borrow.bookId)
  borrows: Borrow[];
}
