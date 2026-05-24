import { Module } from '@nestjs/common';
import { FeaturedFilmController } from './featured-film.controller';
import { FeaturedFilmService } from './featured-film.service';

@Module({
  controllers: [FeaturedFilmController],
  providers: [FeaturedFilmService],
  exports: [FeaturedFilmService],
})
export class FeaturedFilmModule {}
