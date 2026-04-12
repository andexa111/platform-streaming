import 'dotenv/config'; // Load .env PERTAMA sebelum semua import
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validasi DTO otomatis (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // Error kalau ada field asing
      transform: true, // Auto-transform tipe data
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`🚀 Backend running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
