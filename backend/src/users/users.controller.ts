import { 
  Controller, 
  Get, 
  Post,
  Put, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AtGuard } from '../auth/guards/at.guard'; 

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =================================================================
  // CÁC API CẦN ĐĂNG NHẬP (Sử dụng AtGuard)
  // =================================================================
  @UseGuards(AtGuard)
  @Get('me')
  getProfile(@Request() req) {
    const userId = req.user['sub']; 
    return this.usersService.findOne(userId);
  }

  // 3. Cập nhật Profile của CHÍNH MÌNH
  @UseGuards(AtGuard)
  @Put('me')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['sub'];
    return this.usersService.update(userId, updateUserDto);
  }

  // =================================================================
  // CÁC API QUẢN TRỊ (ADMIN) HOẶC XEM NGƯỜI KHÁC
  // =================================================================

  // 4. Xem tất cả user
  @UseGuards(AtGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 5. Xem chi tiết 1 user bất kỳ (theo ID)
  @UseGuards(AtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 6. Admin cập nhật user bất kỳ
  @UseGuards(AtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // 7. Admin xóa user bất kỳ
  @UseGuards(AtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}