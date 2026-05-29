import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ==================== REGISTER ====================

  async register(dto: RegisterDto) {
    if (process.env.BETA_TEST_MODE === 'true') {
      const match = /^dummy\.sinea(10|[1-9])@gmail\.com$/i.exec(dto.email);
      if (match) {
        const index = match[1];
        const expectedPassword = `dummysinea${index}`;
        if (dto.password !== expectedPassword) {
          throw new ForbiddenException(
            `Password untuk akun dummy ${dto.email} harus '${expectedPassword}'`,
          );
        }
      } else {
        throw new ForbiddenException(
          'Registrasi dinonaktifkan sementara selama masa uji coba beta.',
        );
      }
    }

    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Simpan user ke database (belum di-approve)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'user', // langsung jadi user (belum langganan)
      },
    });

    this.logger.log(`User registered: ${user.email}`);

    return {
      message: 'Pendaftaran berhasil! Silakan login untuk melanjutkan.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ==================== LOGIN ====================

  async login(dto: LoginDto) {
    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 3. Beta Test Mode login restriction
    if (process.env.BETA_TEST_MODE === 'true') {
      const isUser = user.role !== 'admin' && user.role !== 'superadmin';
      const isBetaEmail = user.email.toLowerCase() === (process.env.BETA_TEST_EMAIL || '').toLowerCase();
      const isDummyEmail = /^dummy\.sinea(10|[1-9])@gmail\.com$/i.test(user.email);
      if (isUser && !isBetaEmail && !isDummyEmail) {
        throw new ForbiddenException(
          'Akses masuk dibatasi selama masa uji coba beta.',
        );
      }
    }

    // 4. Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'Login berhasil!',
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    };
  }

  // ==================== GET PROFILE ====================

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
        email_verified_at: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    return user;
  }

  // ==================== OAUTH LOGIN ====================

  async validateOAuthLogin(profile: any) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      // Beta Test Mode OAuth restriction
      if (process.env.BETA_TEST_MODE === 'true') {
        const existingRole = user?.role || 'user';
        const isUser = existingRole !== 'admin' && existingRole !== 'superadmin';
        const isBetaEmail = profile.email.toLowerCase() === (process.env.BETA_TEST_EMAIL || '').toLowerCase();
        const isDummyEmail = /^dummy\.sinea(10|[1-9])@gmail\.com$/i.test(profile.email);
        if (isUser && !isBetaEmail && !isDummyEmail) {
          throw new ForbiddenException(
            'Akses masuk dibatasi selama masa uji coba beta.',
          );
        }
      }

      if (!user) {
        // Buat user baru, langsung aktif sbg 'user' biasa
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatar_url,
            role: 'user',
          },
        });
        this.logger.log(`New user created via OAuth: ${user.email}`);
      }

      this.logger.log(`User logged in via OAuth: ${user.email}`);

      // Generate JWT Access Token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = await this.jwtService.signAsync(payload);

      const { password: _, ...userWithoutPassword } = user;
      return {
        status: 'approved',
        message: 'Login sukses via Google',
        access_token,
        user: userWithoutPassword,
      };
    } catch (err) {
      this.logger.error('OAuth login failed', err);
      throw new BadRequestException('OAuth login failed');
    }
  }

  // ==================== FORGOT PASSWORD ====================

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak if user exists
      return { message: 'Jika email terdaftar, instruksi reset password akan dikirimkan.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return { message: 'Jika email terdaftar, instruksi reset password akan dikirimkan.' };
  }

  // ==================== RESET PASSWORD ====================

  async resetPassword(token: string, new_password: string) {
    const emailToken = await this.prisma.emailToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailToken || emailToken.expiresAt < new Date()) {
      throw new BadRequestException('Token tidak valid atau sudah kedaluwarsa');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await this.prisma.user.update({
      where: { id: emailToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.emailToken.delete({ where: { id: emailToken.id } });

    return { message: 'Password berhasil diubah. Silakan login dengan password baru.' };
  }
}
