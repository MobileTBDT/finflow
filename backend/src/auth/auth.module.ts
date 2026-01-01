import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { 
            expiresIn: (configService.get<string>('JWT_EXPIRATION') || '60m') as any, 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}