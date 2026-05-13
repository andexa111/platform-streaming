import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmModule } from './film/film.module';
import { BunnyModule } from './bunny/bunny.module';
import { UploadModule } from './upload/upload.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PrismaModule, AuthModule, FilmModule, BunnyModule, UploadModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
