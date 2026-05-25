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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
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
  ) { }

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
  /**
   * GET /films/:id/stream
   * Mengatur cookie sinea_stream_auth (JWT) dan mengembalikan URL streaming index.m3u8 di R2.
   * User harus login (memiliki token JWT di header/cookie) dan film harus memiliki video_id.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/stream')
  async getStreamUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const film = await this.filmService.findOne(id);

    if (!film.video_id) {
      throw new BadRequestException('Film ini belum memiliki video');
    }

    // Generate JWT token untuk memproteksi path file film ini di Cloudflare Worker
    const secret = process.env.SINEA_STREAM_SECRET || 'optq2hT5KgM9F5ukjhsQUawiW6LnZiOJ';
    const expiresInSeconds = 3 * 3600; // Aktif selama 3 jam
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const crypto = require('crypto');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      allowed_path: `/films/${id}/`,
      exp,
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const jwtToken = `${header}.${payload}.${signature}`;

    // Set cookie sinea_stream_auth agar dibaca oleh Cloudflare Worker
    const isProduction = process.env.NODE_ENV === 'production' || !req.get('host').includes('localhost');
    res.cookie('sinea_stream_auth', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: isProduction ? '.sinea.id' : undefined,
      maxAge: expiresInSeconds * 1000,
    });

    const mediaHost = process.env.MEDIA_HOST || 'https://media.sinea.id';
    const streamUrl = `${mediaHost}/${film.video_id}`;

    return {
      filmId: film.id,
      title: film.title,
      stream_url: streamUrl,
    };
  }

  /**
   * POST /films/:id/upload-video
   * Upload video film utama (.mp4), memicu segmentasi HLS asinkron dan upload ke R2
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post(':id/upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './temp-uploads';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const id = req.params.id;
          const ext = path.extname(file.originalname);
          cb(null, `raw-${id}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Max 5GB
    }),
  )
  async uploadVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File video tidak ditemukan');
    }

    // Mulai proses pemecahan HLS & upload ke R2 di background
    this.processHlsVideo(id, file.path);

    return {
      success: true,
      message: 'Video berhasil diunggah. Pemrosesan HLS berjalan di background.',
    };
  }

  /**
   * Helper pemrosesan video HLS & upload ke R2 di background
   */
  private processHlsVideo(filmId: number, rawFilePath: string) {
    const absoluteRawPath = path.resolve(rawFilePath);
    const tempHlsDir = `./temp-uploads/hls-${filmId}`;
    const absoluteHlsDir = path.resolve(tempHlsDir);

    if (!fs.existsSync(absoluteHlsDir)) {
      fs.mkdirSync(absoluteHlsDir, { recursive: true });
    }

    console.log(`🎬 [HLS Process] Memulai segmentasi HLS untuk Film ID: ${filmId}`);

    // Segmentasi cepat HLS menggunakan FFmpeg (codec copy tanpa kompresi ulang)
    const cmd = `ffmpeg -y -i "${absoluteRawPath}" -c copy -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${absoluteHlsDir}/segment_%03d.ts" "${absoluteHlsDir}/index.m3u8"`;

    const { exec } = require('child_process');
    exec(cmd, async (err: any) => {
      if (err) {
        console.error(`❌ [HLS Process] FFmpeg error untuk Film ID ${filmId}:`, err);
        if (fs.existsSync(absoluteRawPath)) fs.unlinkSync(absoluteRawPath);
        if (fs.existsSync(absoluteHlsDir)) fs.rmSync(absoluteHlsDir, { recursive: true, force: true });
        return;
      }

      console.log(`✅ [HLS Process] Segmentasi selesai. Mengunggah folder ke R2...`);

      try {
        const r2FolderPath = `films/${filmId}`;
        await this.bunnyService.uploadHlsFolder(absoluteHlsDir, r2FolderPath);

        // Perbarui kolom video_id di database dengan path relatif index.m3u8
        await this.filmService.update(filmId, {
          video_id: `films/${filmId}/index.m3u8`,
        } as any);

        console.log(`🎉 [HLS Process] Sukses memproses & mengunggah HLS untuk Film ID: ${filmId}`);
      } catch (uploadErr) {
        console.error(`❌ [HLS Process] Upload/Update DB gagal untuk Film ID ${filmId}:`, uploadErr);
      } finally {
        // Hapus file sementara
        if (fs.existsSync(absoluteRawPath)) {
          try { fs.unlinkSync(absoluteRawPath); } catch (e) {}
        }
        if (fs.existsSync(absoluteHlsDir)) {
          try { fs.rmSync(absoluteHlsDir, { recursive: true, force: true }); } catch (e) {}
        }
      }
    });
  }

  /**
   * PATCH /films/:id/clip
   * Update clip_start & clip_end untuk highlight trailer — admin & superadmin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id/clip')
  async updateClip(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clip_start: number; clip_end: number },
  ) {
    const film = await this.filmService.update(id, {
      clip_start: body.clip_start,
      clip_end: body.clip_end,
    } as any);

    if (film.trailer_url) {
      clipVideoInBackground(film.trailer_url, body.clip_start, body.clip_end);
    }

    return film;
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
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const path = require('path');
    const fs = require('fs');

    const cleanFilename = path.basename(filename);
    const dirPath = './public/uploads/trailers';

    // Try to find if a pre-cut clip file exists for this trailer
    const extname = path.extname(cleanFilename);
    const baseName = path.basename(cleanFilename, extname);
    const clipFilename = extname ? `${baseName}-clip${extname}` : `${baseName}-clip`;

    let targetPath = path.join(dirPath, clipFilename);
    let fileExists = fs.existsSync(targetPath);

    if (!fileExists) {
      targetPath = path.join(dirPath, cleanFilename);
      fileExists = fs.existsSync(targetPath);

      if (!fileExists) {
        const files = fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
        const foundClip = files.find(
          (f: string) => path.basename(f, path.extname(f)) === `${baseName}-clip`
        );
        if (foundClip) {
          targetPath = path.join(dirPath, foundClip);
          fileExists = true;
        } else {
          const foundOriginal = files.find(
            (f: string) => path.basename(f, path.extname(f)) === baseName
          );
          if (foundOriginal) {
            targetPath = path.join(dirPath, foundOriginal);
            fileExists = true;
          }
        }
      }
    }

    if (!fileExists) {
      return res.status(404).send('Trailer tidak ditemukan');
    }

    const stat = fs.statSync(targetPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(targetPath).toLowerCase();

    let contentType = 'video/mp4';
    if (ext === '.mov') {
      contentType = 'video/quicktime';
    }

    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
      });
      const fileStream = fs.createReadStream(targetPath);
      fileStream.on('error', (err: any) => {
        console.error('Error streaming trailer file:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming file');
        }
      });
      return fileStream.pipe(res);
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunkSize = end - start + 1;

    const file = fs.createReadStream(targetPath, {
      start,
      end,
    });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });

    file.pipe(res);
  }
}

// Background helper for FFmpeg video clipping (cuts video from start to end in background)
function clipVideoInBackground(trailerUrl: string, start: number, end: number) {
  const path = require('path');
  const fs = require('fs');
  const { exec } = require('child_process');

  const cleanPath = trailerUrl.startsWith('/') ? trailerUrl.substring(1) : trailerUrl;
  const absoluteFilePath = path.resolve('./public', cleanPath);

  if (!fs.existsSync(absoluteFilePath)) {
    console.warn(`⚠️ File trailer tidak ditemukan untuk pemotongan klip: ${absoluteFilePath}`);
    return;
  }

  // If start and end are both 0 or unset, delete the clip file to force fallback to original video
  if (start === 0 && end === 0) {
    const dir = path.dirname(absoluteFilePath);
    const ext = path.extname(absoluteFilePath);
    const base = path.basename(absoluteFilePath, ext);
    const clipPath = path.join(dir, `${base}-clip${ext}`);
    if (fs.existsSync(clipPath)) {
      try {
        fs.unlinkSync(clipPath);
        console.log(`🗑️ Klip video dihapus karena pengaturan disetel ulang.`);
      } catch (err) {
        console.error('❌ Gagal menghapus klip video:', err);
      }
    }
    return;
  }

  exec('ffmpeg -version', (err: any) => {
    if (err) {
      console.warn('⚠️ FFmpeg tidak terdeteksi pada sistem. Klip video tidak dipotong.');
      return;
    }

    const dir = path.dirname(absoluteFilePath);
    const ext = path.extname(absoluteFilePath);
    const base = path.basename(absoluteFilePath, ext);
    const clipPath = path.join(dir, `${base}-clip${ext}`);

    console.log(`🎬 Mulai pemotongan video klip: ${absoluteFilePath} (${start}s - ${end}s) -> ${clipPath}`);

    // Fast-cutting with libx264 fast preset & +faststart metadata shifting for instant browser play
    const cmd = `ffmpeg -y -ss ${start} -to ${end} -i "${absoluteFilePath}" -vcodec libx264 -preset superfast -crf 24 -acodec aac -b:a 128k -movflags +faststart "${clipPath}"`;

    exec(cmd, (execErr: any) => {
      if (execErr) {
        console.error('❌ Gagal memotong video klip:', execErr);
        if (fs.existsSync(clipPath)) {
          fs.unlinkSync(clipPath);
        }
        return;
      }
      console.log(`🎉 Sukses memotong video klip: ${clipPath}`);
    });
  });
}
