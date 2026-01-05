import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  BadRequestException
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AtGuard } from '../auth/guards/at.guard'; 
import { User } from '../users/entities/user.entity';

@Controller('budgets')
@UseGuards(AtGuard) 
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // 1. Tạo Budget
  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    // Lấy ID từ token, tạo object User giả để truyền vào Service
    const userId = req.user['sub']; 
    const user = { id: userId } as User;
    
    return this.budgetsService.create(createBudgetDto, user);
  }

  // 2. Lấy Budget GẦN NHẤT của 1 Category

  @Get('latest')
  findLatest( @Request() req, @Query('categoryId') categoryId: string ) {
    if (!categoryId) {
        throw new BadRequestException('Vui lòng truyền categoryId');
    }
    const userId = req.user['sub'];
    return this.budgetsService.findLatest(userId, +categoryId);
  }

  // 3. Lấy danh sách Budget (Có thể lọc theo categoryId)
  // URL: GET /budgets?categoryId=5
  @Get()
  findAll( @Request() req, @Query('categoryId') categoryId?: string) {
    const userId = req.user['sub'];
    const catId = categoryId ? +categoryId : undefined;
    
    return this.budgetsService.findAll(userId, catId);
  }

  // 4. Lấy chi tiết 1 Budget theo ID
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user['sub'];
    return this.budgetsService.findOne(+id, userId);
  }

  // 5. Cập nhật Budget theo ID
  @Patch(':id')
  update( @Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto, @Request() req ) {
    const userId = req.user['sub'];
    return this.budgetsService.update(+id, updateBudgetDto, userId);
  }

  // 6. Xóa Budget theo ID
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user['sub'];
    return this.budgetsService.remove(+id, userId);
  }
}