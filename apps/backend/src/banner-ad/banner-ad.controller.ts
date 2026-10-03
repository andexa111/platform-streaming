import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BannerAdService } from './banner-ad.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('banner-ad')
export class BannerAdController {
  constructor(private readonly bannerAdService: BannerAdService) {}

  // Endpoint publik untuk mengambil banner iklan yang aktif di homepage
  @Get('active')
  findActive() {
    return this.bannerAdService.findActive();
  }

  // Endpoint kelola admin/superadmin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get()
  findAll() {
    return this.bannerAdService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerAdService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  create(
    @Body()
    dto: {
      title: string;
      image_url: string;
      link_url?: string;
      is_active?: boolean;
    },
  ) {
    return this.bannerAdService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      title?: string;
      image_url?: string;
      link_url?: string;
      is_active?: boolean;
    },
  ) {
    return this.bannerAdService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerAdService.remove(id);
  }
}
