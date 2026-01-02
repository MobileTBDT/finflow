import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AtGuard } from '../auth/guards/at.guard'; 
import { User } from '../users/entities/user.entity';

@Controller('categories')
@UseGuards(AtGuard) 
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 1. Tạo Category mới (Của riêng User)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const userId = req.user['sub'];
    // Tạo object user giả để truyền vào (hoặc query full user nếu cần logic phức tạp)
    const user = { id: userId } as User;
    return this.categoriesService.create(createCategoryDto, user);
  }

  // 2. Lấy danh sách (Mặc định + Riêng)
  @Get()
  findAll(@Request() req) {
    const userId = req.user['sub'];
    return this.categoriesService.findAll(userId);
  }

  // 3. Xem chi tiết
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user['sub'];
    return this.categoriesService.findOne(+id, userId);
  }

  // 4. Cập nhật (Chặn nếu sửa category hệ thống)
  @Patch(':id')
  update( @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req ) {
    const userId = req.user['sub'];
    return this.categoriesService.update(+id, updateCategoryDto, userId);
  }

  // 5. Xóa (Chặn nếu xóa category hệ thống)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user['sub'];
    return this.categoriesService.remove(+id, userId);
  }
}