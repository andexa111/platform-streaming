import { Controller, Get, Patch, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    const profile = await this.userService.getProfile(req.user.id);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const cleanIp = typeof ip === 'string' ? ip.split(',')[0].trim() : (Array.isArray(ip) ? ip[0] : '127.0.0.1');
    return {
      ...profile,
      ip: cleanIp,
    };
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.userService.updateProfile(req.user.id, body);
  }

  @Patch('change-password')
  changePassword(@Req() req: any, @Body() body: any) {
    return this.userService.changePassword(req.user.id, body);
  }

  @Get('watch-history')
  getWatchHistory(@Req() req: any) {
    return this.userService.getWatchHistory(req.user.id);
  }

  @Post('watch-history')
  upsertWatchHistory(@Req() req: any, @Body() body: { filmId: number; last_position: number }) {
    return this.userService.upsertWatchHistory(req.user.id, body.filmId, body.last_position);
  }
}

// Separate controller for /users (plural) — admin & superadmin
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersAdminController {
  constructor(private readonly userService: UserService) {}

  /** GET /users — List users (superadmin sees all, admin sees subscriber) */
  @Roles('superadmin', 'admin')
  @Get()
  async findAll(@Req() req: any) {
    return this.userService.findAllUsers(req.user.role);
  }

  /** PATCH /users/:id — Update user details (superadmin only) */
  @Roles('superadmin')
  @Patch(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; email?: string; role?: string }) {
    return this.userService.updateUser(id, body);
  }

  /** PATCH /users/:id/role — Change user role (superadmin only) */
  @Roles('superadmin')
  @Patch(':id/role')
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: string) {
    return this.userService.updateUserRole(id, role);
  }

  /** POST /users/:id/reset-password — Reset password (superadmin only) */
  @Roles('superadmin')
  @Post(':id/reset-password')
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  /** DELETE /users/:id — Delete user (superadmin only) */
  @Roles('superadmin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}

