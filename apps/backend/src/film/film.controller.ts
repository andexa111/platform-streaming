import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BunnyService } from '../bunny/bunny.service';

@Controller('films')
export class FilmController {
  constructor(
    private filmService: FilmService,
    private bunnyService: BunnyService,
  ) {}

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * POST /films
   * Buat film baru — hanya admin/superadmin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  create(@Body() dto: CreateFilmDto) {
    return this.filmService.create(dto);
  }

  /**
   * GET /films/admin/all
   * Daftar semua film (termasuk draft & deleted) — hanya admin/superadmin
   * Query: ?search=judul&status=published|draft|deleted&page=1&limit=10
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/all')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.filmService.findAllAdmin({
      search,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  /**
   * PATCH /films/:id
   * Update film — hanya admin/superadmin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFilmDto,
  ) {
    return this.filmService.update(id, dto);
  }

  /**
   * DELETE /films/:id
   * Soft delete film — hanya admin/superadmin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filmService.remove(id);
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * GET /films
   * Daftar film yang sudah published — semua user yang login
   * Query: ?search=judul&genre=comedy&page=1&limit=10
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('genre') genre?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.filmService.findAll({
      search,
      genre,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  /**
   * GET /films/:id
   * Detail 1 film — semua user yang login
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filmService.findOne(id);
  }

  /**
   * GET /films/:id/stream
   * Generate signed URL untuk streaming video film
   * User harus login, film harus punya video_id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/stream')
  async getStreamUrl(@Param('id', ParseIntPipe) id: number) {
    const film = await this.filmService.findOne(id);

    if (!film.video_id) {
      throw new BadRequestException('Film ini belum memiliki video');
    }

    const streamUrl = this.bunnyService.generateSignedStreamUrl(film.video_id);

    return {
      filmId: film.id,
      title: film.title,
      stream_url: streamUrl,
    };
  }
}
