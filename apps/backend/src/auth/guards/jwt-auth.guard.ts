import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — pakai di endpoint yang butuh login
 * Cara pakai: @UseGuards(JwtAuthGuard) di controller
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
