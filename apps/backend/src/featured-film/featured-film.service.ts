import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturedFilmService {
  constructor(private prisma: PrismaService) {}

  /** Public: daftar film teratas + clip info */
  async findAll() {
    return this.prisma.featuredFilm.findMany({
      include: {
        film: {
          select: {
            id: true,
            title: true,
            poster_url: true,
            trailer_url: true,
            video_id: true,
            clip_start: true,
            clip_end: true,
            description: true,
            director: true,
            release_year: true,
            genres: { select: { name: true } },
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  /** Superadmin: set daftar film teratas (replace semua) */
  async setFeaturedFilms(items: { filmId: number; position: number }[]) {
    if (items.length > 10) {
      throw new BadRequestException('Maksimal 10 film teratas');
    }

    // Hapus semua data lama
    await this.prisma.featuredFilm.deleteMany();

    // Insert data baru
    for (const item of items) {
      const film = await this.prisma.film.findUnique({ where: { id: item.filmId } });
      if (!film) throw new NotFoundException(`Film ID ${item.filmId} tidak ditemukan`);

      await this.prisma.featuredFilm.create({
        data: {
          filmId: item.filmId,
          position: item.position,
        },
      });
    }

    return { message: `${items.length} film teratas berhasil diatur.` };
  }

  /** Superadmin: hapus 1 film dari featured */
  async remove(id: number) {
    const item = await this.prisma.featuredFilm.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Featured film tidak ditemukan');
    return this.prisma.featuredFilm.delete({ where: { id } });
  }
}
