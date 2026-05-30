import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        films: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async create(data: { name: string; slug?: string }) {
    const slug = data.slug || this.slugify(data.name);
    
    // Cek duplikasi
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Kategori dengan nama/slug ini sudah ada');
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
      },
    });
  }

  async update(id: number, data: { name?: string; slug?: string }) {
    const updateData: any = {};
    
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.slug || this.slugify(data.name);
      
      // Cek duplikasi jika slug berubah
      const existing = await this.prisma.category.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Kategori dengan nama/slug ini sudah ada');
      }
    } else if (data.slug) {
      updateData.slug = data.slug;
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    // Putuskan semua relasi film sebelum menghapus kategori
    // Prisma implicit many-to-many handles this, but we should make sure
    return this.prisma.category.delete({ where: { id } });
  }
}
