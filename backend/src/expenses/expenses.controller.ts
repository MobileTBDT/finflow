import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới chi tiêu' })
  @ApiResponse({ status: 201, description: 'Expense created' })
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách chi tiêu' })
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiêu theo id' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật chi tiêu' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chi tiêu' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(+id);
  }
}
