import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateHomeSectionDto {
  title: string;
  description?: string;
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

    if (!section) {
      throw new NotFoundException(`Section ${sectionNum} tidak ditemukan`);
    }

    return this.prisma.homeSection.update({
      where: { sectionNum },
      data: {
        title: dto.title,
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

      if (config.sectionNum === 1 || config.sectionNum === 3) {
        // Fetch films in the specified category
        if (config.categorySlug) {
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
        // Coming Soon: active but published_start in future <= 24 hours
        films = await this.prisma.film.findMany({
          where: {
            is_published: true,
            is_deleted: false,
            published_start: {
              gt: now,
              lte: oneDayLater,
            },
          },
          select: filmSelect,
          orderBy: { published_start: 'asc' },
        });
      }

      results.push({
        sectionNum: config.sectionNum,
        title: config.title,
        description: config.description,
        categorySlug: config.categorySlug,
        films,
      });
    }

    return results;
  }
}
