import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmModule } from './film/film.module';
import { BunnyModule } from './bunny/bunny.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, AuthModule, FilmModule, BunnyModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
