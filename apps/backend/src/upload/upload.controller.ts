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
        destination: './public/uploads/posters',
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|webp|x-icon|vnd\.microsoft\.icon)/ }), // +ico support
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/posters/${file.filename}`;
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
        destination: './public/uploads/images',
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|webp|x-icon|vnd\.microsoft\.icon)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/images/${file.filename}`;
    return { url, fileName: file.filename };
  }

  /**
   * POST /upload/trailer
   * Upload video trailer film (Disimpan ke Bunny CDN)
   */
  @Post('trailer')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrailer(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ fileType: /video\/(mp4|webm|quicktime)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const ext = file.originalname.split('.').pop();
    const fileName = `trailer-${uuidv4()}.${ext}`;

    const url = await this.bunnyService.uploadToStorage(
      'trailers',
      fileName,
      file.buffer,
    );

    return { url, fileName };
  }
}
