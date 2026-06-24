import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional } from 'class-validator';

export class UpdateHomeSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;
}

@Injectable()
export class HomeSectionService {
  constructor(private prisma: PrismaService) {}

  /** Admin: get all 3 section configurations */
  async findAll() {
    return this.prisma.homeSection.findMany({
      orderBy: { sectionNum: 'asc' },
    });
  }

  /** Admin: update settings of a specific section */
  async update(sectionNum: number, dto: UpdateHomeSectionDto) {
    const section = await this.prisma.homeSection.findUnique({
      where: { sectionNum },
    });

    let titleToSave = dto.title || (section ? section.title : '');
    if ((sectionNum === 1 || sectionNum === 3) && dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });
      if (category) {
        titleToSave = category.name;
      }
    }

    if (!titleToSave) {
      if (sectionNum === 2) titleToSave = 'Segera Hadir';
      else if (sectionNum === 1) titleToSave = 'FFAB 2026';
      else titleToSave = 'Film Pilihan';
    }

    return this.prisma.homeSection.upsert({
      where: { sectionNum },
      update: {
        title: titleToSave,
        description: dto.description ?? null,
        categorySlug: dto.categorySlug ?? null,
      },
      create: {
        sectionNum,
        title: titleToSave,
        description: dto.description ?? null,
        categorySlug: dto.categorySlug ?? null,
      },
    });
  }

  /** Public/Member: Get populated content with active films */
  async getContent() {
    const sectionsConfig = await this.findAll();
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const filmSelect = {
      id: true,
      title: true,
      description: true,
      producer: true,
      director: true,
      duration: true,
      release_year: true,
      poster_url: true,
      trailer_url: true,
      video_id: true,
      clip_start: true,
      clip_end: true,
      is_published: true,
      published_start: true,
      published_end: true,
      production_house: true,
      production_house_logo: true,
      genres: { select: { name: true, slug: true } },
      categories: { select: { name: true, slug: true } },
    };

    const activeFilter = {
      is_published: true,
      is_deleted: false,
      AND: [
        {
          OR: [
            { published_start: null },
            { published_start: { lte: now } },
          ],
        },
        {
          OR: [
            { published_end: null },
            { published_end: { gte: now } },
          ],
        },
      ],
    };

    const results = [];

    for (const config of sectionsConfig) {
      let films: any[] = [];
      let title = config.title;

      if (config.sectionNum === 1 || config.sectionNum === 3) {
        // Fetch films in the specified category
        if (config.categorySlug) {
          const category = await this.prisma.category.findUnique({
            where: { slug: config.categorySlug },
          });
          if (category) {
            title = category.name;
          }

          films = await this.prisma.film.findMany({
            where: {
              ...activeFilter,
              categories: {
                some: {
                  slug: config.categorySlug,
                },
              },
            },
            select: filmSelect,
            orderBy: { createdAt: 'desc' },
          });
        }
      } else if (config.sectionNum === 2) {
        // Coming Soon: hanya film yang published_start-nya tepat BESOK (H-1) di zona WIB (GMT+7)
        const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
        const nowUtc = new Date();
        const nowWib = new Date(nowUtc.getTime() + WIB_OFFSET_MS);

        const y = nowWib.getUTCFullYear();
        const m = nowWib.getUTCMonth();
        const d = nowWib.getUTCDate();

        // Besok 00:00:00 WIB → konversi ke UTC
        const tomorrowStartUtc = new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
        // Besok 23:59:59.999 WIB → konversi ke UTC
        const tomorrowEndUtc = new Date(Date.UTC(y, m, d + 1, 23, 59, 59, 999) - WIB_OFFSET_MS);

        films = await this.prisma.film.findMany({
          where: {
            is_published: true,
            is_deleted: false,
            published_start: {
              gte: tomorrowStartUtc,
              lte: tomorrowEndUtc,
            },
          },
          select: filmSelect,
          orderBy: { published_start: 'asc' },
        });
      }

      results.push({
        sectionNum: config.sectionNum,
        title,
        description: config.description,
        categorySlug: config.categorySlug,
        films,
      });
    }

    return results;
  }
}
