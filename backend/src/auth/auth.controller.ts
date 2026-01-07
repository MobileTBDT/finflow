import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AtGuard } from './guards/at.guard'; // Import Guard bạn đã viết
import { RtGuard } from './guards/rt.guard'; // Import Guard bạn đã viết

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginData: Record<string, any>) {
    return this.authService.login(loginData);
  }

  @UseGuards(AtGuard) 
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const userId = req.user['sub']; 
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req) {
    
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken']; 

    return this.authService.refreshTokens(userId, refreshToken);
  }

}