import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discount.findMany({
      include: { plan: { select: { id: true, name: true, slug: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    planId: number;
    label: string;
    percentage?: number;
    fixed_amount?: number;
    valid_from: string;
    valid_until: string;
  }) {
    return this.prisma.discount.create({
      data: {
        planId: data.planId,
        label: data.label,
        percentage: data.percentage,
        fixed_amount: data.fixed_amount,
        valid_from: new Date(data.valid_from),
        valid_until: new Date(data.valid_until),
      },
    });
  }

  async update(id: number, data: any) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Diskon tidak ditemukan');

    const updateData: any = { ...data };
    if (data.valid_from) updateData.valid_from = new Date(data.valid_from);
    if (data.valid_until) updateData.valid_until = new Date(data.valid_until);

    return this.prisma.discount.update({ where: { id }, data: updateData });
  }

  async remove(id: number) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Diskon tidak ditemukan');
    return this.prisma.discount.delete({ where: { id } });
  }
}
