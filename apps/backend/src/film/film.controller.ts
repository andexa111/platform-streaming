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
  Req,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BunnyService } from '../bunny/bunny.service';

// Short-lived stream tokens (in-memory)
const streamSessions = new Map<string, { url: string; expiresAt: number }>();

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
   * GET /films/stream/play/:token
   * One-time-use dynamic redirect to Bunny Stream URL.
   * Invalidates immediately upon fetch to block external downloads and copy-pasting.
   */
  @Get('stream/play/:token')
  playStream(@Param('token') token: string, @Res() res: express.Response) {
    const session = streamSessions.get(token);
    if (!session) {
      return res.status(403).send('Akses ditolak: Token tidak valid atau sudah kedaluwarsa');
    }

    if (Date.now() > session.expiresAt) {
      streamSessions.delete(token);
      return res.status(403).send('Akses ditolak: Sesi streaming telah kedaluwarsa');
    }

    // INVALIDATE IMMEDIATELY (one-time use)
    streamSessions.delete(token);

    // Redirect browser to the signed stream URL
    return res.redirect(session.url);
  }

  /**
   * GET /films
   * Daftar film yang sudah published — PUBLIC (Guest bisa akses)
   * Query: ?search=judul&genre=comedy&page=1&limit=10
   */
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
   * Detail 1 film — PUBLIC (Guest bisa akses)
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filmService.findOne(id);
  }

  /**
   * GET /films/:id/stream
   * Generate signed URL untuk streaming video film
   * User harus login, film harus punya video_id
   */
  @Get(':id/stream')
  async getStreamUrl(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const film = await this.filmService.findOne(id);

    if (!film.video_id) {
      throw new BadRequestException('Film ini belum memiliki video');
    }

    const realStreamUrl = this.bunnyService.generateSignedStreamUrl(film.video_id);

    // Clean up expired tokens to prevent leaks
    const now = Date.now();
    for (const [key, val] of streamSessions.entries()) {
      if (now > val.expiresAt) {
        streamSessions.delete(key);
      }
    }

    // Generate random short-lived token (valid for 30s to initiate player load)
    const token = uuidv4();
    streamSessions.set(token, {
      url: realStreamUrl,
      expiresAt: now + 30 * 1000,
    });

    const host = req.get('host') || 'localhost:3001';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const dynamicUrl = `${protocol}://${host}/films/stream/play/${token}`;

    return {
      filmId: film.id,
      title: film.title,
      stream_url: dynamicUrl,
    };
  }

  /**
   * PATCH /films/:id/clip
   * Update clip_start & clip_end untuk highlight trailer — superadmin only
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Patch(':id/clip')
  async updateClip(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clip_start: number; clip_end: number },
  ) {
    return this.filmService.update(id, {
      clip_start: body.clip_start,
      clip_end: body.clip_end,
    } as any);
  }

  /**
   * POST /films/:id/view
   * Rekam view ketika user menonton film
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  async recordView(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body('watched_seconds') watched_seconds: number,
  ) {
    if (watched_seconds == null) {
      throw new BadRequestException('watched_seconds is required');
    }
    return this.filmService.recordView(id, req.user.id, watched_seconds);
  }

  /**
   * GET /films/trailer-stream/:filename
   * Stream trailer file dynamically as application/octet-stream to prevent IDM sniffing.
   * Path does not end with .mp4 or any video extension.
   */
  @Get('trailer-stream/:filename')
  streamTrailer(
    @Param('filename') filename: string,
    @Res() res: express.Response,
  ) {
    const path = require('path');
    const fs = require('fs');

    const cleanFilename = path.basename(filename);
    const dirPath = './public/uploads/trailers';
    let targetPath = path.join(dirPath, cleanFilename);

    if (!fs.existsSync(targetPath)) {
      const files = fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
      const found = files.find(
        (f: string) => path.basename(f, path.extname(f)) === cleanFilename,
      );
      if (found) {
        targetPath = path.join(dirPath, found);
      } else {
        return res.status(404).send('Trailer tidak ditemukan');
      }
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');

    const fileStream = fs.createReadStream(targetPath);
    fileStream.on('error', (err: any) => {
      console.error('Error streaming trailer file:', err);
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });
    fileStream.pipe(res);
  }
}
