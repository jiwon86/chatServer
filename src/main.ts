import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // DTO에 없는 값은 제거
      forbidNonWhitelisted: true, // DTO에 없는 값 들어오면 예외
      transform: true,         // plain object → DTO 클래스로 변환
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
