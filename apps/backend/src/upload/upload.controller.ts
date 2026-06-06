import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BunnyService } from '../bunny/bunny.service';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

import sharp from 'sharp';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class UploadController {
  constructor(private bunnyService: BunnyService) {}

  /**
   * POST /upload/poster
   * Upload gambar poster film (Disimpan Lokal & Dikompres)
   */
  @Post('poster')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './public/uploads/posters';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `poster-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPoster(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ 
            fileType: /image\/(jpg|jpeg|png|webp|x-icon|vnd\.microsoft\.icon)/,
            skipMagicNumbersValidation: true,
            fallbackToMimetype: true,
          }), // +ico support
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Compress image in-place
    try {
      const ext = extname(file.originalname).toLowerCase();
      const tempPath = file.path + '-temp';
      fs.renameSync(file.path, tempPath);

      let pipeline = sharp(tempPath).resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true });

      if (ext === '.png') {
        pipeline = pipeline.png({ compressionLevel: 8, palette: true });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 80 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      } else {
        // SVG, ICO, dll. - biarkan format asli tanpa konversi sharp
        fs.copyFileSync(tempPath, file.path);
        fs.unlinkSync(tempPath);
        return { url: `uploads/posters/${file.filename}`, fileName: file.filename };
      }

      await pipeline.toFile(file.path);
      fs.unlinkSync(tempPath);
    } catch (err) {
      console.error('Poster compression failed, using original file:', err);
      if (fs.existsSync(file.path + '-temp')) {
        fs.renameSync(file.path + '-temp', file.path);
      }
    }

    const url = `uploads/posters/${file.filename}`;
    return { url, fileName: file.filename };
  }

  /**
   * POST /upload/image
   * Upload gambar umum (Avatar, Iklan, Favicon, Foto Sutradara/Aktor) (Disimpan Lokal & Dikompres)
   */
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './public/uploads/images';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `img-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ 
            fileType: /image\/(jpg|jpeg|png|webp|x-icon|vnd\.microsoft\.icon)/,
            skipMagicNumbersValidation: true,
            fallbackToMimetype: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Compress image in-place
    try {
      const ext = extname(file.originalname).toLowerCase();
      const tempPath = file.path + '-temp';
      fs.renameSync(file.path, tempPath);

      let pipeline = sharp(tempPath).resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true });

      if (ext === '.png') {
        pipeline = pipeline.png({ compressionLevel: 8, palette: true });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 80 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      } else {
        // SVG, ICO, dll. - biarkan format asli tanpa konversi sharp
        fs.copyFileSync(tempPath, file.path);
        fs.unlinkSync(tempPath);
        return { url: `uploads/images/${file.filename}`, fileName: file.filename };
      }

      await pipeline.toFile(file.path);
      fs.unlinkSync(tempPath);
    } catch (err) {
      console.error('Image compression failed, using original file:', err);
      if (fs.existsSync(file.path + '-temp')) {
        fs.renameSync(file.path + '-temp', file.path);
      }
    }

    const url = `uploads/images/${file.filename}`;
    return { url, fileName: file.filename };
  }

  /**
   * POST /upload/trailer
   * Upload video trailer film (Disimpan Lokal)
   */
  @Post('trailer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './public/uploads/trailers';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `trailer-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadTrailer(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ 
            fileType: /video\/(mp4|webm|quicktime|x-matroska|avi)/,
            skipMagicNumbersValidation: true,
            fallbackToMimetype: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const ext = extname(file.originalname);
    const filenameWithoutExt = path.basename(file.filename, ext);
    const targetFilename = `${filenameWithoutExt}.mp4`;
    const url = `uploads/trailers/${targetFilename}`;
    
    // Trigger background compression
    compressVideoInBackground(file.path, targetFilename);

    return { url, fileName: targetFilename };
  }
}

// Background helper for FFmpeg video compression (CRF 24, AAC audio)
function compressVideoInBackground(filePath: string, targetFilename: string) {
  const absoluteFilePath = path.resolve(filePath);
  const dir = path.dirname(absoluteFilePath);
  const targetPath = path.join(dir, targetFilename);

  exec('ffmpeg -version', (err) => {
    if (err) {
      console.warn('⚠️ FFmpeg tidak terdeteksi pada sistem. File video disimpan tanpa kompresi.');
      if (absoluteFilePath !== targetPath) {
        try {
          fs.renameSync(absoluteFilePath, targetPath);
        } catch (renameErr) {
          console.error('❌ Gagal merename file asli ke target:', renameErr);
        }
      }
      return;
    }

    const tempPath = path.join(dir, `temp-${targetFilename}`);

    console.log(`🎬 Mulai kompresi video di background: ${absoluteFilePath} -> ${tempPath}`);

    // Compress with x264, preset fast, CRF 24 (high quality, low size), AAC 128k audio
    const cmd = `ffmpeg -y -i "${absoluteFilePath}" -vcodec libx264 -crf 24 -preset fast -acodec aac -b:a 128k "${tempPath}"`;

    exec(cmd, (execErr) => {
      if (execErr) {
        console.error('❌ Gagal melakukan kompresi video:', execErr);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        if (absoluteFilePath !== targetPath) {
          try {
            fs.renameSync(absoluteFilePath, targetPath);
          } catch (renameErr) {
            console.error('❌ Gagal merename file asli ke target setelah error:', renameErr);
          }
        }
        return;
      }

      console.log('✅ Kompresi video selesai. Menggantikan file asli...');
      try {
        if (fs.existsSync(targetPath) && absoluteFilePath !== targetPath) {
          fs.unlinkSync(targetPath);
        }
        fs.renameSync(tempPath, targetPath);
        if (absoluteFilePath !== targetPath && fs.existsSync(absoluteFilePath)) {
          fs.unlinkSync(absoluteFilePath);
        }
        console.log('🎉 Sukses membuat file terkompresi.');
      } catch (renameErr) {
        console.error('❌ Gagal memproses file kompresi:', renameErr);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });
}
