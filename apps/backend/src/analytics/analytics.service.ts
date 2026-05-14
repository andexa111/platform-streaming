import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count({ where: { role: 'user' } });
    const totalSubscribers = await this.prisma.user.count({ where: { role: 'subscriber' } });
    
    // Total Revenue (only paid payments)
    const revenues = await this.prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });

    const totalRevenue = revenues._sum.amount || 0;

    // Top 5 Films
    const topFilms = await this.prisma.film.findMany({
      take: 5,
      orderBy: {
        filmViews: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { filmViews: true }
        }
      }
    });

    return {
      totalUsers,
      totalSubscribers,
      totalRevenue,
      topFilms: topFilms.map(f => ({
        id: f.id,
        title: f.title,
        views: f._count.filmViews,
        poster_url: f.poster_url
      }))
    };
  }
}
