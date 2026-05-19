import { Controller, Get, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FeaturedFilmService } from './featured-film.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('featured-films')
export class FeaturedFilmController {
  constructor(private service: FeaturedFilmService) {}

  /** GET /featured-films — Public */
  @Get()
  findAll() { return this.service.findAll(); }

  /** PUT /featured-films — Superadmin: set semua film teratas */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Put()
  setFeaturedFilms(@Body() body: { items: { filmId: number; position: number }[] }) {
    return this.service.setFeaturedFilms(body.items);
  }

  /** DELETE /featured-films/:id — Superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
