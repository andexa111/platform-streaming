import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@Injectable()
export class FilmService {
  private readonly logger = new Logger(FilmService.name);

  constructor(private prisma: PrismaService) {}

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

    this.logger.log(`Film updated: ${film.title} (ID: ${film.id})`);
    return film;
  }

  // ==================== SOFT DELETE ====================

  /**
   * Soft delete — film tidak dihapus dari database,
   * tapi di-flag is_deleted = true
   * Tidak muncul lagi di list user, tapi admin masih bisa lihat
   */
  async remove(id: number) {
    await this.findOne(id);

    const film = await this.prisma.film.update({
      where: { id },
      data: { is_deleted: true, is_published: false },
    });

    this.logger.log(`Film soft deleted: ${film.title} (ID: ${film.id})`);
    return { message: `Film "${film.title}" berhasil dihapus` };
  }
}
