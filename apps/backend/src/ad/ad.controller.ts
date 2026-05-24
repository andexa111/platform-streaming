import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdService } from './ad.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get('serve')
  serveRandomAd() {
    return this.adService.serveRandomAd();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get()
  findAll() {
    return this.adService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  create(@Body() createAdDto: { title: string; duration: number; video_url: string; is_active: boolean }) {
    return this.adService.create(createAdDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdDto: { title?: string; duration?: number; video_url?: string; is_active?: boolean }) {
    return this.adService.update(+id, updateAdDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adService.remove(+id);
  }
}
