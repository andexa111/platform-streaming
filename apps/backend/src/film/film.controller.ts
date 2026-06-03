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
  NotFoundException,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  create(@Body() dto: CreateFilmDto, @Req() req: any) {
    const user = req.user;
    if (user?.role !== 'superadmin') {
      const isCustomStart = dto.published_start !== undefined && dto.published_start !== null && dto.published_start !== 'tomorrow';
      const isCustomEnd = dto.published_end !== undefined && dto.published_end !== null;
      const isCustomScheduled = dto.scheduled_at !== undefined && dto.scheduled_at !== null;

      if (isCustomStart || isCustomEnd || isCustomScheduled) {
        throw new BadRequestException('Hanya Superadmin yang diperbolehkan mengatur jadwal tayang film.');
      }

      if (dto.published_start === 'tomorrow') {
        const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
        const nowUtc = new Date();
        const tomorrowWib = new Date(nowUtc.getTime() + WIB_OFFSET_MS + 24 * 60 * 60 * 1000);
        dto.published_start = tomorrowWib.toISOString().split('T')[0];
        dto.published_end = null as any;
        dto.scheduled_at = undefined;
      }
    }
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
    @Req() req: any,
  ) {
    const user = req.user;
    if (user?.role !== 'superadmin') {
      const isCustomStart = dto.published_start !== undefined && dto.published_start !== null && dto.published_start !== 'tomorrow';
      const isCustomEnd = dto.published_end !== undefined && dto.published_end !== null;
      const isCustomScheduled = dto.scheduled_at !== undefined && dto.scheduled_at !== null;

      if (isCustomStart || isCustomEnd || isCustomScheduled) {
        throw new BadRequestException('Hanya Superadmin yang diperbolehkan mengatur jadwal tayang film.');
      }

      if (dto.published_start === 'tomorrow') {
        const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
        const nowUtc = new Date();
        const tomorrowWib = new Date(nowUtc.getTime() + WIB_OFFSET_MS + 24 * 60 * 60 * 1000);
        dto.published_start = tomorrowWib.toISOString().split('T')[0];
        dto.published_end = null as any;
        dto.scheduled_at = undefined;
      }
    }
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
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.filmService.findAll({
      search,
      genre,
      category,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      upcoming: upcoming === 'true',
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

    const user = req.user;
    const now = new Date();
    if (
      film.published_start &&
      new Date(film.published_start) > now &&
      user?.role !== 'admin' &&
      user?.role !== 'superadmin'
    ) {
      throw new BadRequestException('Film ini belum dirilis');
    }

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
   * GET /films/:id/key
   * Mengambil kunci dekripsi HLS AES-128 untuk film tertentu.
   * Hanya user terotentikasi (JWT) yang diizinkan mengambil kunci ini.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/key')
  async getDecryptionKey(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: express.Response,
  ) {
    try {
      const keyBuffer = await this.bunnyService.getFromStorage(`keys/film-${id}.key`);
      
      res.set({
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      
      return res.send(keyBuffer);
    } catch (err) {
      console.error(`❌ Gagal mengambil kunci untuk film ${id}:`, err);
      throw new NotFoundException('Kunci tidak ditemukan atau Anda tidak memiliki akses');
    }
  }

  /**
   * GET /films/:id/presigned-upload
   * Dapatkan link presigned upload langsung ke Cloudflare R2 untuk file video utama
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id/presigned-upload')
  async getPresignedUpload(
    @Param('id', ParseIntPipe) id: number,
    @Query('contentType') contentType?: string,
  ) {
    const key = `films/${id}/video.mp4`;
    const uploadUrl = await this.bunnyService.getPresignedUploadUrl(key, contentType || 'video/mp4');
    return {
      success: true,
      upload_url: uploadUrl,
      key,
    };
  }

  /**
   * POST /films/:id/process-uploaded-video
   * Memicu pemrosesan HLS setelah video utama selesai diunggah langsung ke R2
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post(':id/process-uploaded-video')
  async processUploadedVideo(@Param('id', ParseIntPipe) id: number) {
    // Mulai proses pemecahan HLS di background dengan mendownload dari R2 dahulu
    this.processHlsVideoFromR2(id);

    return {
      success: true,
      message: 'Pemrosesan HLS dimulai di background.',
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

    console.log(`🎬 [HLS Process] Memulai segmentasi HLS AES-128 untuk Film ID: ${filmId}`);

    // Generate AES-128 key & key info file
    const crypto = require('crypto');
    const key = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16).toString('hex');
    const keyPath = path.join(tempHlsDir, 'video.key');
    const keyInfoPath = path.join(tempHlsDir, 'key_info.txt');

    fs.writeFileSync(keyPath, key);

    const backendUrl = process.env.BACKEND_URL || 'https://api.sinea.id';
    const keyUri = `${backendUrl}/films/${filmId}/key`;
    const keyInfoContent = `${keyUri}\n${path.resolve(keyPath)}\n${iv}`;
    fs.writeFileSync(keyInfoPath, keyInfoContent);

    // Segmentasi cepat HLS menggunakan FFmpeg dengan enkripsi
    const cmd = `ffmpeg -y -i "${absoluteRawPath}" -c copy -hls_time 10 -hls_key_info_file "${path.resolve(keyInfoPath)}" -hls_playlist_type vod -hls_segment_filename "${absoluteHlsDir}/segment_%03d.ts" "${absoluteHlsDir}/index.m3u8"`;

    const { exec } = require('child_process');
    exec(cmd, async (err: any) => {
      if (err) {
        console.warn(`⚠️ [HLS Process] FFmpeg tidak tersedia atau gagal untuk Film ID ${filmId}. Menggunakan fallback upload MP4 mentah...`);
        try {
          if (!fs.existsSync(absoluteRawPath)) {
            throw new Error(`File raw mp4 tidak ditemukan pada path: ${absoluteRawPath}`);
          }
          const rawBuffer = fs.readFileSync(absoluteRawPath);
          const r2Key = `films/${filmId}/video.mp4`;

          // Upload raw mp4 to R2 as fallback
          await this.bunnyService.uploadToStorage(
            `films/${filmId}`,
            'video.mp4',
            rawBuffer,
            'video/mp4'
          );

          // Update database video_id to point directly to the mp4 file
          await this.filmService.update(filmId, {
            video_id: r2Key,
          } as any);

          console.log(`🎉 [HLS Process] Fallback MP4 sukses untuk Film ID: ${filmId}`);
        } catch (fallbackErr) {
          console.error(`❌ [HLS Process] Fallback MP4 gagal untuk Film ID ${filmId}:`, fallbackErr);
        } finally {
          if (fs.existsSync(absoluteRawPath)) {
            try { fs.unlinkSync(absoluteRawPath); } catch (e) {}
          }
          if (fs.existsSync(absoluteHlsDir)) {
            try { fs.rmSync(absoluteHlsDir, { recursive: true, force: true }); } catch (e) {}
          }
        }
        return;
      }

      console.log(`✅ [HLS Process] Segmentasi selesai. Mengunggah folder ke R2...`);

      try {
        // Upload key ke R2 secara privat di folder keys/
        await this.bunnyService.uploadToStorage(
          'keys',
          `film-${filmId}.key`,
          key,
          'application/octet-stream'
        );

        // Hapus file key lokal sebelum mengunggah seluruh folder HLS ke R2
        // Supaya file key dan key_info tidak ikut terupload ke folder publik films/
        if (fs.existsSync(keyPath)) {
          try { fs.unlinkSync(keyPath); } catch (e) {}
        }
        if (fs.existsSync(keyInfoPath)) {
          try { fs.unlinkSync(keyInfoPath); } catch (e) {}
        }

        const r2FolderPath = `films/${filmId}`;
        await this.bunnyService.uploadHlsFolder(absoluteHlsDir, r2FolderPath);

        // Perbarui kolom video_id di database dengan path relatif index.m3u8
        await this.filmService.update(filmId, {
          video_id: `films/${filmId}/index.m3u8`,
        } as any);

        console.log(`🎉 [HLS Process] Sukses memproses & mengunggah HLS AES-128 untuk Film ID: ${filmId}`);
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

  /**
   * Helper pemrosesan video HLS dari file yang sudah ada di R2 di background
   */
  private async processHlsVideoFromR2(filmId: number) {
    const tempDir = `./temp-uploads`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const rawFilePath = `${tempDir}/raw-${filmId}.mp4`;
    const absoluteRawPath = path.resolve(rawFilePath);
    const tempHlsDir = `./temp-uploads/hls-${filmId}`;
    const absoluteHlsDir = path.resolve(tempHlsDir);

    if (!fs.existsSync(absoluteHlsDir)) {
      fs.mkdirSync(absoluteHlsDir, { recursive: true });
    }

    console.log(`🎬 [HLS Process] Mengunduh video mentah dari R2 untuk Film ID: ${filmId}`);

    try {
      // 1. Download file video mentah dari R2
      const r2Key = `films/${filmId}/video.mp4`;
      await this.bunnyService.downloadFromStorage(r2Key, absoluteRawPath);

      // 2. Lakukan HLS segmentasi menggunakan FFmpeg dengan enkripsi AES-128
      console.log(`🎬 [HLS Process] Memulai segmentasi HLS AES-128 untuk Film ID: ${filmId}`);

      const crypto = require('crypto');
      const key = crypto.randomBytes(16);
      const iv = crypto.randomBytes(16).toString('hex');
      const keyPath = path.join(tempHlsDir, 'video.key');
      const keyInfoPath = path.join(tempHlsDir, 'key_info.txt');

      fs.writeFileSync(keyPath, key);

      const backendUrl = process.env.BACKEND_URL || 'https://api.sinea.id';
      const keyUri = `${backendUrl}/films/${filmId}/key`;
      const keyInfoContent = `${keyUri}\n${path.resolve(keyPath)}\n${iv}`;
      fs.writeFileSync(keyInfoPath, keyInfoContent);

      const cmd = `ffmpeg -y -i "${absoluteRawPath}" -c copy -hls_time 10 -hls_key_info_file "${path.resolve(keyInfoPath)}" -hls_playlist_type vod -hls_segment_filename "${absoluteHlsDir}/segment_%03d.ts" "${absoluteHlsDir}/index.m3u8"`;

      const { exec } = require('child_process');
      exec(cmd, async (err: any) => {
        if (err) {
          console.warn(`⚠️ [HLS Process] FFmpeg gagal/tidak ada untuk Film ID ${filmId}. Memakai fallback raw MP4...`);
          try {
            // Karena raw MP4 sudah ada di R2, kita cukup update video_id ke key raw MP4 tersebut!
            await this.filmService.update(filmId, {
              video_id: r2Key,
            } as any);
            console.log(`🎉 [HLS Process] Fallback MP4 sukses untuk Film ID: ${filmId}`);
          } catch (updateErr) {
            console.error(`❌ [HLS Process] Gagal mengupdate fallback video_id:`, updateErr);
          } finally {
            if (fs.existsSync(absoluteRawPath)) {
              try { fs.unlinkSync(absoluteRawPath); } catch (e) {}
            }
            if (fs.existsSync(absoluteHlsDir)) {
              try { fs.rmSync(absoluteHlsDir, { recursive: true, force: true }); } catch (e) {}
            }
          }
          return;
        }

        console.log(`✅ [HLS Process] Segmentasi selesai. Mengunggah folder ke R2...`);
        try {
          // Upload key ke R2 secara privat di folder keys/
          await this.bunnyService.uploadToStorage(
            'keys',
            `film-${filmId}.key`,
            key,
            'application/octet-stream'
          );

          // Hapus file key lokal sebelum mengunggah seluruh folder HLS ke R2
          if (fs.existsSync(keyPath)) {
            try { fs.unlinkSync(keyPath); } catch (e) {}
          }
          if (fs.existsSync(keyInfoPath)) {
            try { fs.unlinkSync(keyInfoPath); } catch (e) {}
          }

          const r2FolderPath = `films/${filmId}`;
          await this.bunnyService.uploadHlsFolder(absoluteHlsDir, r2FolderPath);

          // Perbarui kolom video_id di database dengan path relatif index.m3u8
          await this.filmService.update(filmId, {
            video_id: `${r2FolderPath}/index.m3u8`,
          } as any);

          console.log(`🎉 [HLS Process] Sukses memproses & mengunggah HLS AES-128 untuk Film ID: ${filmId}`);
        } catch (uploadErr) {
          console.error(`❌ [HLS Process] Upload/Update DB gagal untuk Film ID ${filmId}:`, uploadErr);
        } finally {
          if (fs.existsSync(absoluteRawPath)) {
            try { fs.unlinkSync(absoluteRawPath); } catch (e) {}
          }
          if (fs.existsSync(absoluteHlsDir)) {
            try { fs.rmSync(absoluteHlsDir, { recursive: true, force: true }); } catch (e) {}
          }
        }
      });
    } catch (downloadErr) {
      console.error(`❌ [HLS Process] Gagal mengunduh berkas mentah dari R2 untuk Film ID ${filmId}:`, downloadErr);
      // Jika download gagal, pastikan hapus folder temp
      if (fs.existsSync(absoluteHlsDir)) {
        try { fs.rmSync(absoluteHlsDir, { recursive: true, force: true }); } catch (e) {}
      }
    }
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
