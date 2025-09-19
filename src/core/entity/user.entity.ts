import { BaseEntity } from 'src/common/database/base.entity';
import { Roles } from 'src/common/enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { BookHistory } from './book-history.entity';
import { Borrow } from './borrow.entity';

@Entity('User')
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  hashed_password: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.READER })
  role: Roles;

  @OneToMany(() => Borrow, (borrow) => borrow.userId)
  borrows: Borrow[];

  @OneToMany(() => BookHistory, (history) => history.userId)
  bookHistory: BookHistory[];
}
