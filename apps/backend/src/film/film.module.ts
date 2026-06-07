import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [FilmController],
  providers: [FilmService],
  exports: [FilmService],
})
export class FilmModule {}
