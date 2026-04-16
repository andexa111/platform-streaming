import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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

    // 3. Simpan user ke database
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'guest', // Default role saat register, nanti jadi 'user' setelah verify email
      },
    });

    // 4. Buat token verifikasi email
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
      },
    });

    // 5. Kirim email verifikasi
    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    this.logger.log(`User registered: ${user.email}`);

    return {
      message: 'Registrasi berhasil! Cek email kamu untuk verifikasi.',
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

    // 3. Cek apakah email sudah diverifikasi
    if (!user.email_verified_at) {
      throw new UnauthorizedException(
        'Email belum diverifikasi. Cek inbox kamu.',
      );
    }

    // 4. Generate JWT token
    const payload = {
      sub: user.id, // subject = user id
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

  // ==================== VERIFY EMAIL ====================

  async verifyEmail(token: string) {
    // 1. Cari token di database
    const emailToken = await this.prisma.emailToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailToken) {
      throw new BadRequestException('Token tidak valid');
    }

    // 2. Cek apakah token sudah expired
    if (emailToken.expiresAt < new Date()) {
      throw new BadRequestException('Token sudah kedaluwarsa');
    }

    // 3. Update user: set email_verified_at + upgrade role ke 'user'
    await this.prisma.user.update({
      where: { id: emailToken.userId },
      data: {
        email_verified_at: new Date(),
        role: 'user',
      },
    });

    // 4. Hapus token (sudah terpakai)
    await this.prisma.emailToken.delete({
      where: { id: emailToken.id },
    });

    this.logger.log(`Email verified: ${emailToken.user.email}`);

    return {
      message: 'Email berhasil diverifikasi! Silakan login.',
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

  /**
   * OAuth Login Logic
   */
  async validateOAuthLogin(profile: any) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        // Create new user, automatically verified if from Google
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatar_url,
            email_verified_at: new Date(),
            // Empty password since they use OAuth
          },
        });
        this.logger.log(`New user created via OAuth: ${user.email}`);
      } else if (!user.email_verified_at) {
        // If email was unverified but they logged in via Google with the same email, we trust it and verify it
        user = await this.prisma.user.update({
          where: { email: user.email },
          data: { email_verified_at: new Date() },
        });
        this.logger.log(`User automatically verified via OAuth: ${user.email}`);
      }

      this.logger.log(`User logged in via OAuth: ${user.email}`);

      // Generate JWT Access Token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = await this.jwtService.signAsync(payload);

      // Return both token and user info without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: 'Login sukses via Google',
        access_token,
        user: userWithoutPassword,
      };
    } catch (err) {
      this.logger.error('OAuth login failed', err);
      throw new BadRequestException('OAuth login failed');
    }
  }
}
