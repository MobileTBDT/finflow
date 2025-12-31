import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') { // 'jwt' là tên mặc định
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_AT_SECRET, // Dùng secret của Access Token
    });
  }

  // Khi Token hợp lệ, hàm này tự chạy và trả về payload
  validate(payload: any) {
    return payload; // req.user sẽ bằng cái này (vd: { sub: 1, username: 'Tuan' })
  }
} 