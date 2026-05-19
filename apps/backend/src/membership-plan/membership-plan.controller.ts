import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MembershipPlanService } from './membership-plan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('membership-plans')
export class MembershipPlanController {
  constructor(private service: MembershipPlanService) {}

  /** GET /membership-plans — Public: paket aktif + diskon */
  @Get()
  findAllActive() {
    return this.service.findAllActive();
  }

  /** GET /membership-plans/admin — Superadmin: semua paket */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Get('admin')
  findAll() {
    return this.service.findAll();
  }

  /** POST /membership-plans — Superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  /** PATCH /membership-plans/:id — Superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  /** DELETE /membership-plans/:id — Superadmin */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
