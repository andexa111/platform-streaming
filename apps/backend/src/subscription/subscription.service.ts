import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubStatus, Role } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private prisma: PrismaService) {}

  async getPendingSubscriptions() {
    return this.prisma.subscription.findMany({
      where: { status: SubStatus.pending },
      include: {
        user: { select: { id: true, name: true, email: true, avatar_url: true } },
        plan: { select: { id: true, name: true, duration_months: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async approveSubscription(id: number) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status === SubStatus.active) throw new BadRequestException('Subscription is already active');

    // Calculate expired_at based on plan's duration
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + sub.plan.duration_months);

    // Update subscription to active
    await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubStatus.active,
        expired_at: expiredAt,
      },
    });

    // Update user role to subscriber if they are currently just a user
    const user = await this.prisma.user.findUnique({ where: { id: sub.userId } });
    if (user && user.role === Role.user) {
      await this.prisma.user.update({
        where: { id: sub.userId },
        data: { role: Role.subscriber },
      });
    }

    this.logger.log(`Subscription ${id} approved for user ${user?.email}. Expires: ${expiredAt}`);
    return { message: 'Subscription approved successfully' };
  }

  async rejectSubscription(id: number) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    await this.prisma.subscription.update({
      where: { id },
      data: { status: SubStatus.inactive },
    });

    this.logger.log(`Subscription ${id} rejected/cancelled.`);
    return { message: 'Subscription rejected successfully' };
  }
}
