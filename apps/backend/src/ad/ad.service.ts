import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ad.findMany();
  }

  async findOne(id: number) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async create(data: { title: string; duration: number; video_url: string; is_active: boolean }) {
    return this.prisma.ad.create({ data });
  }

  async update(id: number, data: { title?: string; duration?: number; video_url?: string; is_active?: boolean }) {
    return this.prisma.ad.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.ad.delete({ where: { id } });
  }

  // Get a random active ad for free users
  async serveRandomAd() {
    const ads = await this.prisma.ad.findMany({ where: { is_active: true } });
    if (ads.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * ads.length);
    return ads[randomIndex];
  }
}
