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

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class UploadController {
  constructor(private bunnyService: BunnyService) {}

  /**
   * POST /upload/poster
   * Upload gambar poster film (Disimpan Lokal)
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
    const url = `uploads/posters/${file.filename}`;
    return { url, fileName: file.filename };
  }

  /**
   * POST /upload/image
   * Upload gambar umum (Avatar, Iklan, Favicon) (Disimpan Lokal)
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 * 1024 }), // 5GB
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
    const url = `uploads/trailers/${file.filename}`;
    
    // Trigger background compression
    compressVideoInBackground(file.path);

    return { url, fileName: file.filename };
  }
}

// Background helper for FFmpeg video compression (CRF 24, AAC audio)
function compressVideoInBackground(filePath: string) {
  const absoluteFilePath = path.resolve(filePath);

  exec('ffmpeg -version', (err) => {
    if (err) {
      console.warn('⚠️ FFmpeg tidak terdeteksi pada sistem. File video disimpan tanpa kompresi.');
      return;
    }

    const dir = path.dirname(absoluteFilePath);
    const ext = path.extname(absoluteFilePath);
    const base = path.basename(absoluteFilePath, ext);
    const tempPath = path.join(dir, `${base}-temp.mp4`);

    console.log(`🎬 Mulai kompresi video di background: ${absoluteFilePath} -> ${tempPath}`);

    // Compress with x264, preset fast, CRF 24 (high quality, low size), AAC 128k audio
    const cmd = `ffmpeg -y -i "${absoluteFilePath}" -vcodec libx264 -crf 24 -preset fast -acodec aac -b:a 128k "${tempPath}"`;

    exec(cmd, (execErr) => {
      if (execErr) {
        console.error('❌ Gagal melakukan kompresi video:', execErr);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        return;
      }

      console.log('✅ Kompresi video selesai. Menggantikan file asli...');
      try {
        fs.renameSync(tempPath, absoluteFilePath);
        console.log('🎉 Sukses menggantikan file asli dengan file terkompresi.');
      } catch (renameErr) {
        console.error('❌ Gagal mengganti file asli:', renameErr);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });
}
