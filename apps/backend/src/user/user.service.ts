import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, data: { name?: string; avatar_url?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: number, body: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(body.old_password, user.password || '');
    if (!isMatch) throw new BadRequestException('Old password incorrect');

    const hashedPassword = await bcrypt.hash(body.new_password, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Watch History
  async getWatchHistory(userId: number) {
    return this.prisma.watchHistory.findMany({
      where: { userId, is_completed: false },
      include: {
        film: {
          select: { id: true, title: true, poster_url: true, duration: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertWatchHistory(userId: number, filmId: number, last_position: number) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');

    const isCompleted = film.duration && (last_position >= (film.duration * 60) - 60); // mark complete if < 1 min left

    return this.prisma.watchHistory.upsert({
      where: {
        userId_filmId: { userId, filmId },
      },
      update: {
        last_position,
        is_completed: isCompleted ? true : false,
      },
      create: {
        userId,
        filmId,
        last_position,
        is_completed: isCompleted ? true : false,
      },
    });
  }
}
