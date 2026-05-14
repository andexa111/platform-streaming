import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.genre.create({ data });
  }

  async update(id: number, data: { name?: string; slug?: string }) {
    return this.prisma.genre.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.genre.delete({ where: { id } });
  }
}
