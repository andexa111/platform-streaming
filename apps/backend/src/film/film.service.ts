import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { BunnyService } from '../bunny/bunny.service';

@Injectable()
export class FilmService {
  private readonly logger = new Logger(FilmService.name);

  constructor(
    private prisma: PrismaService,
    private bunnyService: BunnyService,
  ) {}

  // ==================== CREATE ====================

  /**
   * Admin buat film baru
   * - Genre dihubungkan via genreIds (many-to-many)
   * - Actor dibuat baru jika belum ada (connectOrCreate)
   */
  async create(dto: CreateFilmDto) {
    const { genreIds, actorNames, scheduled_at, ...filmData } = dto;

    const film = await this.prisma.film.create({
      data: {
        ...filmData,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,

        // Hubungkan genre (many-to-many)
        genres: genreIds?.length
          ? { connect: genreIds.map((id) => ({ id })) }
          : undefined,

        // Buat actor baru atau hubungkan yang sudah ada
        actors: actorNames?.length
          ? {
              connectOrCreate: actorNames.map((name) => ({
                where: { id: 0 }, // Force create karena actor tidak punya unique name
                create: { name },
              })),
            }
          : undefined,
      },
      include: {
        genres: true,
        actors: true,
      },
    });

    this.logger.log(`Film created: ${film.title} (ID: ${film.id})`);
    return film;
  }

  // ==================== FIND ALL (User) ====================

  /**
   * User lihat daftar film (hanya yang published & tidak dihapus)
   * Support: search, filter genre, pagination
   */
  async findAll(query: {
    search?: string;
    genre?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, genre, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      is_published: true,
      is_deleted: false,
    };

    // Filter pencarian berdasarkan judul
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Filter berdasarkan genre slug
    if (genre) {
      where.genres = { some: { slug: genre } };
    }

    const [films, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: true,
          actors: true,
        },
      }),
      this.prisma.film.count({ where }),
    ]);

    return {
      data: films,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== FIND ALL (Admin) ====================

  /**
   * Admin lihat semua film (termasuk draft & deleted)
   */
  async findAllAdmin(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Filter status: published, draft, deleted
    if (status === 'published') {
      where.is_published = true;
      where.is_deleted = false;
    } else if (status === 'draft') {
      where.is_published = false;
      where.is_deleted = false;
    } else if (status === 'deleted') {
      where.is_deleted = true;
    }

    const [films, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: true,
          actors: true,
        },
      }),
      this.prisma.film.count({ where }),
    ]);

    return {
      data: films,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== FIND ONE ====================

  /**
   * Ambil detail 1 film berdasarkan ID
   */
  async findOne(id: number) {
    const film = await this.prisma.film.findUnique({
      where: { id },
      include: {
        genres: true,
        actors: true,
      },
    });

    if (!film) {
      throw new NotFoundException(`Film dengan ID ${id} tidak ditemukan`);
    }

    // User biasa tidak boleh lihat film yang belum published / sudah dihapus
    return film;
  }

  // ==================== UPDATE ====================

  /**
   * Admin update data film
   * - Bisa update sebagian field saja (partial update)
   * - Genre di-replace (disconnect semua, connect yang baru)
   */
  async update(id: number, dto: UpdateFilmDto) {
    // Pastikan film ada
    await this.findOne(id);

    const { genreIds, actorNames, scheduled_at, ...filmData } = dto;

    const updateData: any = {
      ...filmData,
    };

    if (scheduled_at !== undefined) {
      updateData.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
    }

    // Update genre: hapus semua relasi lama, hubungkan yang baru
    if (genreIds !== undefined) {
      updateData.genres = {
        set: [], // Disconnect semua genre lama
        connect: genreIds.map((id) => ({ id })), // Connect genre baru
      };
    }

    // Update actor: hapus semua relasi lama, buat/hubungkan yang baru
    if (actorNames !== undefined) {
      updateData.actors = {
        set: [], // Disconnect semua actor lama
        ...(actorNames.length > 0 && {
          connectOrCreate: actorNames.map((name) => ({
            where: { id: 0 },
            create: { name },
          })),
        }),
      };
    }

    const film = await this.prisma.film.update({
      where: { id },
      data: updateData,
      include: {
        genres: true,
        actors: true,
      },
    });

    // Log update operation completion
    this.logger.log(`Film updated: ${film.title} (ID: ${film.id})`);
    return film;
  }

  // ==================== HARD DELETE ====================

  /**
   * Helper untuk menghapus file lokal
   */
  private deleteLocalFile(relativeUrl: string | null) {
    if (!relativeUrl) return;
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) return;

    const absolutePath = path.resolve('./public', relativeUrl);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        this.logger.log(`Deleted local file: ${absolutePath}`);

        // Bersihkan klip trailer jika menghapus trailer asli
        if (relativeUrl.includes('uploads/trailers/')) {
          const ext = path.extname(absolutePath);
          const base = path.basename(absolutePath, ext);
          const clipPath = path.join(path.dirname(absolutePath), `${base}-clip${ext}`);
          if (fs.existsSync(clipPath)) {
            fs.unlinkSync(clipPath);
            this.logger.log(`Deleted local trailer clip: ${clipPath}`);
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed to delete local file ${absolutePath}: ${err.message}`);
      }
    }
  }

  /**
   * Hard Delete — Hapus film permanen dari database
   * sekaligus membersihkan file video di Cloudflare R2
   * dan file lokal (poster, trailer, logo)
   */
  async remove(id: number) {
    const film = await this.findOne(id);

    // 1. Hapus file lokal (poster, trailer, logo)
    this.deleteLocalFile(film.poster_url);
    this.deleteLocalFile(film.trailer_url);
    this.deleteLocalFile(film.production_house_logo);

    // 2. Hapus file video di Cloudflare R2
    // Hapus folder HLS 'films/<id>/'
    await this.bunnyService.deleteHlsFolder(`films/${id}`);
    // Hapus key dekripsi 'keys/film-<id>.key'
    try {
      await this.bunnyService.deleteFromStorage('keys', `film-${id}.key`);
    } catch (e: any) {
      this.logger.warn(`Could not delete key film-${id}.key from R2: ${e.message}`);
    }

    // 3. Bersihkan data relasi di database untuk menghindari foreign key constraint error
    await this.prisma.filmView.deleteMany({ where: { filmId: id } });
    await this.prisma.watchHistory.deleteMany({ where: { filmId: id } });
    await this.prisma.featuredFilm.deleteMany({ where: { filmId: id } });

    // 4. Hapus record film itu sendiri
    await this.prisma.film.delete({
      where: { id },
    });

    this.logger.log(`Film hard deleted: ${film.title} (ID: ${film.id})`);
    return { message: `Film "${film.title}" berhasil dihapus secara permanen` };
  }

  // ==================== VIEWS ====================

  /**
   * Rekam view pengguna untuk sebuah film
   * - Minimal 300 detik (5 menit)
   * - 1 user = 1 view per film per 24 jam
   */
  async recordView(filmId: number, userId: number, watched_seconds: number) {
    await this.findOne(filmId);

    // Syarat 1: Nonton minimal 5 menit (300 detik)
    if (watched_seconds < 300) {
      return { message: 'View not counted (watched less than 5 minutes)', counted: false };
    }

    // Syarat 2: Belum ada view dalam 24 jam terakhir
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const recentView = await this.prisma.filmView.findFirst({
      where: {
        filmId,
        userId,
        createdAt: {
          gte: yesterday
        }
      }
    });

    if (recentView) {
      return { message: 'View already counted in the last 24 hours', counted: false };
    }

    // Lolos kedua syarat, catat sebagai view
    await this.prisma.filmView.create({
      data: {
        filmId,
        userId,
        watched_seconds,
        counted: true
      }
    });

    return { message: 'View successfully counted', counted: true };
  }
}
