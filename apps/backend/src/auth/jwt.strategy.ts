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
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['token'];
          }
          if (!token && req && req.headers && req.headers.cookie) {
            const cookieStr = req.headers.cookie;
            const match = cookieStr.match(/(?:^|;)\s*token\s*=\s*([^;]+)/);
            if (match) {
              token = decodeURIComponent(match[1]);
            }
          }
          return token;
        },
      ]),
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
