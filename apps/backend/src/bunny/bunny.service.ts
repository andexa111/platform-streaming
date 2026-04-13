import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class BunnyService {
  private readonly logger = new Logger(BunnyService.name);

  // Bunny Storage config
  private readonly storageApiKey = process.env.BUNNY_STORAGE_API_KEY || '';
  private readonly storageZone = process.env.BUNNY_STORAGE_ZONE || 'lalakon-assets';
  private readonly storageHost =
    process.env.BUNNY_STORAGE_HOSTNAME || 'sg.storage.bunnycdn.com';
  private readonly cdnUrl =
    process.env.BUNNY_CDN_URL || 'https://lalakon-cdn.b-cdn.net';

  // Bunny Stream config
  private readonly streamApiKey = process.env.BUNNY_STREAM_API_KEY || '';
  private readonly streamLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
  private readonly streamTokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || '';

  // ==================== STORAGE: UPLOAD ====================

  /**
   * Upload file ke Bunny Storage
   * @param folder - folder tujuan (posters/, trailers/, ads/)
   * @param fileName - nama file
   * @param fileBuffer - isi file (Buffer)
   * @returns CDN URL dari file yang diupload
   */
  async uploadToStorage(
    folder: string,
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<string> {
    const path = `/${this.storageZone}/${folder}/${fileName}`;
    const url = `https://${this.storageHost}${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: this.storageApiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Upload gagal: ${error}`);
      throw new Error(`Upload ke Bunny Storage gagal: ${error}`);
    }

    const cdnFileUrl = `${this.cdnUrl}/${folder}/${fileName}`;
    this.logger.log(`File uploaded: ${cdnFileUrl}`);
    return cdnFileUrl;
  }

  // ==================== STORAGE: DELETE ====================

  /**
   * Hapus file dari Bunny Storage
   * @param folder - folder file (posters/, trailers/)
   * @param fileName - nama file yang dihapus
   */
  async deleteFromStorage(folder: string, fileName: string): Promise<void> {
    const path = `/${this.storageZone}/${folder}/${fileName}`;
    const url = `https://${this.storageHost}${path}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        AccessKey: this.storageApiKey,
      },
    });

    if (!response.ok) {
      this.logger.warn(`Delete gagal untuk ${folder}/${fileName}`);
    } else {
      this.logger.log(`File deleted: ${folder}/${fileName}`);
    }
  }

  // ==================== STREAM: SIGNED URL ====================

  /**
   * Generate signed URL untuk streaming video (token auth)
   * URL berlaku selama expiresInHours jam
   *
   * Ini dipakai untuk embed video player di frontend:
   * <iframe src="signedUrl" allow="autoplay; fullscreen"></iframe>
   */
  generateSignedStreamUrl(
    videoId: string,
    expiresInHours: number = 6,
  ): string {
    const expiresTimestamp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;

    // Token = SHA256(tokenKey + videoId + expiresTimestamp)
    const hashableBase = `${this.streamTokenKey}${videoId}${expiresTimestamp}`;
    const token = crypto
      .createHash('sha256')
      .update(hashableBase)
      .digest('hex');

    const signedUrl = `https://iframe.mediadelivery.net/embed/${this.streamLibraryId}/${videoId}?token=${token}&expires=${expiresTimestamp}`;

    this.logger.log(`Signed URL generated for video: ${videoId}`);
    return signedUrl;
  }

  // ==================== STREAM: GET VIDEO LIST ====================

  /**
   * Ambil daftar video dari Bunny Stream Library
   */
  async getStreamVideos(): Promise<any> {
    const url = `https://video.bunnycdn.com/library/${this.streamLibraryId}/videos`;

    const response = await fetch(url, {
      headers: {
        AccessKey: this.streamApiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil daftar video dari Bunny Stream');
    }

    return response.json();
  }
}
