import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipPlanService {
  constructor(private prisma: PrismaService) {}

  // Public: list paket aktif (+ diskon aktif)
  async findAllActive() {
    const plans = await this.prisma.membershipPlan.findMany({
      where: { is_active: true },
      include: {
        discounts: {
          where: {
            is_active: true,
            valid_from: { lte: new Date() },
            valid_until: { gte: new Date() },
          },
        },
      },
      orderBy: { price: 'asc' },
    });

    return plans.map((plan) => {
      const activeDiscount = plan.discounts[0] || null;
      let discountedPrice = plan.price;

      if (activeDiscount) {
        if (activeDiscount.percentage) {
          discountedPrice = Math.round(plan.price * (1 - activeDiscount.percentage / 100));
        } else if (activeDiscount.fixed_amount) {
          discountedPrice = Math.max(0, plan.price - activeDiscount.fixed_amount);
        }
      }

      return {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        price: plan.price,
        discounted_price: activeDiscount ? discountedPrice : null,
        discount: activeDiscount ? {
          label: activeDiscount.label,
          percentage: activeDiscount.percentage,
          fixed_amount: activeDiscount.fixed_amount,
          valid_until: activeDiscount.valid_until,
        } : null,
        benefits: plan.benefits,
        max_devices: plan.max_devices,
        quality: plan.quality,
      };
    });
  }

  // Admin: list semua paket
  async findAll() {
    return this.prisma.membershipPlan.findMany({
      include: { discounts: true },
      orderBy: { price: 'asc' },
    });
  }

  async create(data: { slug: string; name: string; price: number; benefits: string[]; max_devices?: number; quality?: string }) {
    return this.prisma.membershipPlan.create({ data });
  }

  async update(id: number, data: { name?: string; price?: number; benefits?: string[]; max_devices?: number; quality?: string; is_active?: boolean }) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Paket tidak ditemukan');
    return this.prisma.membershipPlan.update({ where: { id }, data });
  }

  async remove(id: number) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Paket tidak ditemukan');
    return this.prisma.membershipPlan.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
