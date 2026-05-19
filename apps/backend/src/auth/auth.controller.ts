import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Body: { name, email, password }
   * Response: { message, user } — user belum di-approve
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Body: { email, password }
   * Response: { message, access_token, user }
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/profile
   * Header: Authorization: Bearer <token>
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  // ==================== GOOGLE OAUTH ====================

  /**
   * GET /auth/google
   * Redirects user to Google OAuth Screen
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req: any) {
    // Action handled by AuthGuard
  }

  /**
   * GET /auth/google/callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: express.Response) {
    const loginResult = await this.authService.validateOAuthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // User approved, redirect dengan token
    return res.redirect(`${frontendUrl}/auth/callback?token=${loginResult.access_token}`);
  }



  // ==================== PASSWORD RECOVERY ====================

  /**
   * POST /auth/forgot-password
   * Body: { email }
   */
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  /**
   * POST /auth/reset-password
   * Body: { token, new_password }
   */
  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.new_password);
  }
}
