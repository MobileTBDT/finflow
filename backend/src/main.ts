// main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Kích hoạt Validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu client gửi thừa field rác
    transform: true, // Tự động chuyển đổi type (vd: string -> number, string -> Date)
  }));

  await app.listen(3000);
}
bootstrap();