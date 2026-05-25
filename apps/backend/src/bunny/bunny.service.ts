import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BunnyService {
  private readonly logger = new Logger(BunnyService.name);

  // Cloudflare R2 configuration
  private readonly s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || '',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    region: 'auto',
    forcePathStyle: true,
  });
  private readonly bucketName = process.env.S3_BUCKET_NAME || 'sinea-media';

  constructor() {
    this.logger.log(`[R2 CONFIG DETECTED] S3_ENDPOINT: "${process.env.S3_ENDPOINT || 'EMPTY/UNDEFINED'}", BUCKET: "${this.bucketName}"`);
  }

  /**
   * Upload file tunggal ke Cloudflare R2
   */
  async uploadToStorage(
    folder: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    const key = `${folder}/${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    const publicUrl = `${process.env.MEDIA_HOST || 'https://media.sinea.id'}/${key}`;
    this.logger.log(`Uploaded file to R2: ${key}`);
    return publicUrl;
  }

  /**
   * Hapus file tunggal dari Cloudflare R2
   */
  async deleteFromStorage(folder: string, fileName: string): Promise<void> {
    const key = `${folder}/${fileName}`;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
    this.logger.log(`Deleted file from R2: ${key}`);
  }

  /**
   * Upload seluruh folder HLS (index.m3u8 + segment_*.ts) ke Cloudflare R2 secara asinkron
   */
  async uploadHlsFolder(localFolderPath: string, r2FolderPath: string): Promise<void> {
    if (!fs.existsSync(localFolderPath)) {
      throw new Error(`Direktori lokal tidak ditemukan: ${localFolderPath}`);
    }

    const files = fs.readdirSync(localFolderPath);
    for (const file of files) {
      const filePath = path.join(localFolderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const fileContent = fs.readFileSync(filePath);
        const r2Key = `${r2FolderPath}/${file}`;

        let contentType = 'application/octet-stream';
        if (file.endsWith('.m3u8')) {
          contentType = 'application/x-mpegURL';
        } else if (file.endsWith('.ts')) {
          contentType = 'video/MP2T';
        }

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: r2Key,
            Body: fileContent,
            ContentType: contentType,
          }),
        );
        this.logger.log(`Uploaded HLS file to R2: ${r2Key}`);
      }
    }
  }

  /**
   * Menghapus seluruh folder video di R2
   */
  async deleteHlsFolder(r2FolderPath: string): Promise<void> {
    // Di S3/R2, tidak ada konsep folder nyata, semua adalah key datar.
    // Menghapus folder berarti menghapus semua objek dengan prefix folder tersebut.
    // Untuk kesederhanaan, kita bisa biarkan kosong atau implementasikan list-and-delete jika diperlukan nanti.
    this.logger.log(`Request delete folder R2 (ignored for prefix simplicity): ${r2FolderPath}`);
  }

  /**
   * Mengunduh file dari Cloudflare R2 ke local filesystem VPS
   */
  async downloadFromStorage(key: string, localFilePath: string): Promise<void> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    return new Promise((resolve, reject) => {
      const stream = response.Body as Readable;
      const fileStream = fs.createWriteStream(localFilePath);
      stream.pipe(fileStream);
      stream.on('error', (err) => {
        this.logger.error(`Stream error downloading ${key}: ${err.message}`);
        reject(err);
      });
      fileStream.on('finish', () => {
        this.logger.log(`Successfully downloaded R2 file ${key} to ${localFilePath}`);
        resolve();
      });
      fileStream.on('error', (err) => {
        this.logger.error(`FileStream error writing to ${localFilePath}: ${err.message}`);
        reject(err);
      });
    });
  }

  /**
   * Mendapatkan link upload langsung (presigned URL) ke Cloudflare R2 untuk client-side upload
   */
  async getPresignedUploadUrl(key: string, contentType: string = 'video/mp4'): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    // Link aktif selama 15 menit (900 detik)
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    this.logger.log(`Generated presigned upload URL for: ${key}`);
    return url;
  }
}
