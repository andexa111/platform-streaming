import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PartnerLogoService } from './partner-logo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('partner-logos')
export class PartnerLogoController {
  constructor(private readonly partnerLogoService: PartnerLogoService) {}

  /**
   * GET /partner-logos
   * Endpoint publik untuk mengambil logo partner aktif di homepage
   */
  @Get()
  findAllActive() {
    return this.partnerLogoService.findAllActive();
  }

  /**
   * GET /partner-logos/admin
   * Endpoint admin untuk list 6 slot logo
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin')
  findAllForAdmin() {
    return this.partnerLogoService.findAllForAdmin();
  }

  /**
   * POST /partner-logos/bulk
   * Endpoint admin untuk menyimpan bulk perubahan logo partner
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('bulk')
  updateBulk(
    @Body('slots')
    slots: {
      slot: number;
      name: string;
      logo_url: string;
      is_active: boolean;
    }[],
  ) {
    return this.partnerLogoService.updateBulk(slots);
  }
}
