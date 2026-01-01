import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService, 
  ) {}

  async register(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return { 
      ...tokens,
      info: newUser
    };
  }

  async login(loginDto: any) {
    const user = await this.usersService.FindByUsername(loginDto.username);
    if (!user) throw new UnauthorizedException('Tên đăng nhập không tồn tại!!!');

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng!!!');

    const tokens = await this.getTokens(user.id, user.username);
    
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
      info: user 
    };
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);

    if (!rtMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.username);

    await this.updateRtHash(user.id, tokens.refresh_token);
    
    return tokens;
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.usersService.update(userId, { refreshToken: hash });
  }

  async getTokens(userId: number, username: string) {
    const payload = { sub: userId, username: username};

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}