import { Controller, Post, Patch, Get, Param, Req, UseGuards } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/enum';

@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.LIBRARIAN, Roles.READER)
  @Post(':bookId')
  @ApiBearerAuth()
  borrowBook(@Param('bookId') bookId: string, @Req() req: any) {
    return this.borrowService.borrowBook(bookId, req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN,Roles.ADMIN, Roles.LIBRARIAN, Roles.READER)
  @Patch(':id/return')
  @ApiBearerAuth()
  returnBook(@Param('id') id: string) {
    return this.borrowService.returnBook(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN,Roles.ADMIN, Roles.LIBRARIAN, Roles.READER)
  @Get('my')
  @ApiBearerAuth()
  myBorrows(@Req() req: any) {
    return this.borrowService.myBorrows(req.user.id);
  }
}
