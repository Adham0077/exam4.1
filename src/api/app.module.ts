import { Module } from '@nestjs/common';
import { Application } from './app.service';
import {ConfigModule} from '@nestjs/config'
import { config } from 'src/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowModule } from './borrow/borrow.module';
import { User } from 'src/core/entity/user.entity';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/book-history.entity';
import { Borrow } from 'src/core/entity/borrow.entity';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: config.DB_SYNC,
      entities: [User, Book, BookHistory, Borrow],
      autoLoadEntities: true,
    }),
    JwtModule.register({
      global: true,
    }),
    UserModule,
    BookModule,
    BorrowModule,
  ],
})
export class AppModule {}
