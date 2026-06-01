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

  // Admin/Superadmin: get users
  async findAllUsers(requesterRole?: string) {
    // Admin hanya bisa melihat subscriber/user/guest, superadmin bisa lihat semua
    const whereClause: any = requesterRole === 'admin'
      ? { role: { in: ['guest', 'user', 'subscriber'] } }
      : {};

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
        email_verified_at: true,
        createdAt: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            expired_at: true,
            plan: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten subscription data for easier frontend consumption
    return users.map((u) => {
      const activeSub = u.subscriptions[0] || null;
      return {
        ...u,
        subscriptions: undefined,
        activePlan: activeSub ? activeSub.plan.name : null,
        activePlanSlug: activeSub ? activeSub.plan.slug : null,
        subExpiredAt: activeSub ? activeSub.expired_at : null,
      };
    });
  }

  async updateUser(userId: number, data: { name?: string; email?: string; role?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new BadRequestException('Email sudah digunakan oleh user lain');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });
    return updated;
  }

  async updateUserRole(userId: number, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, name: true, email: true, role: true },
    });
    return updated;
  }

  async resetPassword(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const defaultPassword = 'SINEA123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil direset', defaultPassword };
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Delete related data first to avoid FK constraint errors
    await this.prisma.watchHistory.deleteMany({ where: { userId } });
    await this.prisma.filmView.deleteMany({ where: { userId } });
    await this.prisma.emailToken.deleteMany({ where: { userId } });
    await this.prisma.payment.deleteMany({ where: { userId } });
    await this.prisma.subscription.deleteMany({ where: { userId } });
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully' };
  }
}
