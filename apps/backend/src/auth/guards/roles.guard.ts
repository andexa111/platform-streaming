import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard — cek apakah user punya role yang diizinkan
 * Cara pakai:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin', 'superadmin')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil roles yang diizinkan dari decorator @Roles()
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Kalau tidak ada @Roles(), semua boleh akses
    if (!requiredRoles) {
      return true;
    }

    // Ambil user dari request (sudah di-set oleh JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Cek apakah role user termasuk yang diizinkan
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Kamu tidak punya akses untuk fitur ini',
      );
    }

    return true;
  }
}
