import { Controller, Get, Patch, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
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
