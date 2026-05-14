import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActorService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.actor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const actor = await this.prisma.actor.findUnique({ where: { id } });
    if (!actor) throw new NotFoundException('Actor not found');
    return actor;
  }

  async create(data: { name: string }) {
    return this.prisma.actor.create({ data });
  }

  async update(id: number, data: { name: string }) {
    return this.prisma.actor.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.actor.delete({ where: { id } });
  }
}
