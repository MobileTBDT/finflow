import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, Query 
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AtGuard } from '../auth/guards/at.guard'; // Guard bảo vệ
import { User } from '../users/entities/user.entity';

@Controller('transactions')
@UseGuards(AtGuard) // Bắt buộc đăng nhập
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // 1. Tạo giao dịch (Income/Expense)
  @Post()
  create(@Body() createDto: CreateTransactionDto, @Request() req) {
    const userId = req.user['sub'];
    return this.transactionsService.create(createDto, { id: userId } as User);
  }

  @Get() 
  findAll(@Request() req) {
    const userId = req.user['sub'];
    return this.transactionsService.findAll(userId); 
  }

  // 2. Lấy danh sách giao dịch trong tháng này theo loại
  @Get('current-month')
  findByTypeCurrentMonth(
    @Request() req, 
    @Query('type') type: 'INCOME' | 'EXPENSE'
  ) {
    const userId = req.user['sub'];
    return this.transactionsService.findAllByTypeCurrentMonth(userId, type || 'EXPENSE');
  }

  // 3. Báo cáo Chi tiêu (Expense) theo từng ngày trong tuần
  @Get('weekly-report')
  getWeeklyReport(@Request() req) {
    const userId = req.user['sub'];
    return this.transactionsService.getWeeklyExpenseDaily(userId);
  }

  // 4. Báo cáo Chi tiêu (Expense) theo Category trong tháng
  @Get('monthly-category-report')
  getMonthlyCategoryReport(@Request() req) {
    const userId = req.user['sub'];
    return this.transactionsService.getMonthlyExpenseByCategory(userId);
  }

  // 5. Cập nhật
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateTransactionDto,
    @Request() req
  ) {
    const userId = req.user['sub'];
    return this.transactionsService.update(+id, updateDto, userId);
  }

  // 6. Xóa
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user['sub'];
    return this.transactionsService.remove(+id, userId);
  }
}