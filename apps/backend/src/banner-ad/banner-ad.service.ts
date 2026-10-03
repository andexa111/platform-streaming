import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannerAdService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bannerAd.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.bannerAd.findMany({
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const bannerAd = await this.prisma.bannerAd.findUnique({
      where: { id },
    });
    if (!bannerAd) {
      throw new NotFoundException(`Banner Ad dengan ID ${id} tidak ditemukan`);
    }
    return bannerAd;
  }

  async create(data: { title: string; image_url: string; link_url?: string; is_active?: boolean }) {
    return this.prisma.bannerAd.create({
      data: {
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url || null,
        is_active: data.is_active ?? true,
      },
    });
  }

  async update(id: number, data: { title?: string; image_url?: string; link_url?: string; is_active?: boolean }) {
    await this.findOne(id);
    return this.prisma.bannerAd.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bannerAd.delete({
      where: { id },
    });
  }
}
