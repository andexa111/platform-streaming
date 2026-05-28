import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PartnerLogoService {
  private readonly logger = new Logger(PartnerLogoService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Mengambil semua logo partner yang aktif untuk homepage public
   */
  async findAllActive() {
    return this.prisma.partnerLogo.findMany({
      where: { is_active: true },
      orderBy: { slot: 'asc' },
    });
  }

  /**
   * Mengambil semua 6 slot logo partner untuk CMS Admin (isi default jika belum ada)
   */
  async findAllForAdmin() {
    const existing = await this.prisma.partnerLogo.findMany({
      orderBy: { slot: 'asc' },
    });

    const result = [];
    for (let slot = 1; slot <= 6; slot++) {
      const found = existing.find((p: any) => p.slot === slot);
      if (found) {
        result.push(found);
      } else {
        result.push({
          id: -slot,
          name: '',
          logo_url: '',
          slot,
          is_active: true,
        });
      }
    }
    return result;
  }

  /**
   * Melakukan bulk update untuk semua/sebagian slot
   */
  async updateBulk(slots: { slot: number; name: string; logo_url: string; is_active: boolean }[]) {
    const results = [];
    for (const item of slots) {
      // Validasi range slot
      if (item.slot < 1 || item.slot > 6) {
        continue;
      }

      // Ambil data lama untuk hapus file jika logo_url berubah
      const existing = await this.prisma.partnerLogo.findUnique({
        where: { slot: item.slot },
      });

      if (existing && existing.logo_url && existing.logo_url !== item.logo_url) {
        this.deleteLocalFile(existing.logo_url);
      }

      const upserted = await this.prisma.partnerLogo.upsert({
        where: { slot: item.slot },
        update: {
          name: item.name,
          logo_url: item.logo_url,
          is_active: item.is_active,
        },
        create: {
          slot: item.slot,
          name: item.name,
          logo_url: item.logo_url,
          is_active: item.is_active,
        },
      });

      this.logger.log(`Partner logo slot ${item.slot} updated: "${item.name}"`);
      results.push(upserted);
    }
    return { success: true, data: results };
  }

  /**
   * Helper untuk menghapus berkas lokal lama
   */
  private deleteLocalFile(relativeUrl: string) {
    if (!relativeUrl) return;
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) return;

    const absolutePath = path.resolve('./public', relativeUrl);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        this.logger.log(`Deleted replaced partner logo file: ${absolutePath}`);
      } catch (err: any) {
        this.logger.error(`Failed to delete local partner logo ${absolutePath}: ${err.message}`);
      }
    }
  }
}
