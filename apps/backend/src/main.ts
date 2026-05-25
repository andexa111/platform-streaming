import * as dotenv from 'dotenv';
import * as path from 'path';
// Load .env dari folder backend
dotenv.config();
// Fallback: Load .env dari root folder monorepo jika berada di path berbeda
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../..', '.env') });

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
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  const server = app.getHttpServer();
  // Set timeout to 30 minutes (1,800,000 ms) for large video uploads (up to 5GB)
  server.setTimeout(30 * 60 * 1000);
  
  await app.listen(port);
  Logger.log(`🚀 Backend running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
