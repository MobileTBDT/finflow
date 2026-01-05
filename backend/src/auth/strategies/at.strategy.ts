import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') { 
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET'); // Hoặc 'JWT_SECRET' tùy file .env của bạn
    
    console.log('================================================');
    console.log('GIÁ TRỊ SECRET ĐỌC ĐƯỢC LÀ:', secret); 
    console.log('================================================');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret!, // Dùng secret của Access Token
    });
  }

  validate(payload: any) {
    return payload; 
  }
} 