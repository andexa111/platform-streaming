import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator — tentukan role yang boleh akses endpoint
 * Cara pakai: @Roles('admin', 'superadmin')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
