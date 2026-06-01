import { Controller, Get, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { HomeSectionService, UpdateHomeSectionDto } from './home-section.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('home-sections')
export class HomeSectionController {
  constructor(private service: HomeSectionService) {}

  /** GET /home-sections/content — Public & Members */
  @Get('content')
  getContent() {
    return this.service.getContent();
  }

  /** GET /home-sections — Admin: list all configurations */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** PUT /home-sections/:sectionNum — Admin: update configurations */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Put(':sectionNum')
  update(
    @Param('sectionNum', ParseIntPipe) sectionNum: number,
    @Body() dto: UpdateHomeSectionDto,
  ) {
    return this.service.update(sectionNum, dto);
  }
}
