import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API: POST /auth/register
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // API: POST /auth/login
  @HttpCode(HttpStatus.OK) // Mặc định POST là 201, login nên trả về 200
  @Post('login')
  async login(@Body() loginData: Record<string, any>) {
    return this.authService.login(loginData);
  }
}