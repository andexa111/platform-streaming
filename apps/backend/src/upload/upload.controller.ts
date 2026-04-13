import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BunnyService } from '../bunny/bunny.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class UploadController {
  constructor(private bunnyService: BunnyService) {}

  /**
   * POST /upload/poster
   * Upload gambar poster film
   * Content-Type: multipart/form-data
   * Field: file (max 5MB, hanya jpg/png/webp)
   *
   * Return: { url: "https://lalakon-cdn.b-cdn.net/posters/xxx.jpg" }
   */
  @Post('poster')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPoster(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Generate unique filename: poster-uuid.ext
    const ext = file.originalname.split('.').pop();
    const fileName = `poster-${uuidv4()}.${ext}`;

    const url = await this.bunnyService.uploadToStorage(
      'posters',
      fileName,
      file.buffer,
    );

    return { url, fileName };
  }

  /**
   * POST /upload/trailer
   * Upload video trailer film
   * Content-Type: multipart/form-data
   * Field: file (max 100MB, hanya mp4/webm/mov)
   *
   * Return: { url: "https://lalakon-cdn.b-cdn.net/trailers/xxx.mp4" }
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
