import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

/**
 * JwtStrategy — validasi JWT token dari header Authorization
 * Setiap request yang pakai @UseGuards(JwtAuthGuard) akan melewati sini
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-ganti-ini',
    });
  }

  /**
   * Dipanggil setelah JWT valid
   * Return value ini akan masuk ke req.user
   */
  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
