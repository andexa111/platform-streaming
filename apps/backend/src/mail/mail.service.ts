import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  // Email pengirim — nanti ganti ke noreply@lalakon.id setelah domain verified
  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Lalakon <onboarding@resend.dev>';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Kirim email verifikasi ke user baru
   * @param email - Email tujuan
   * @param name - Nama user
   * @param token - Token verifikasi (akan jadi link)
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verifikasi Email — Lalakon',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Selamat Datang di Lalakon! 🎬</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Terima kasih sudah mendaftar. Klik tombol di bawah untuk verifikasi email kamu:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background-color: #e94560; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Verifikasi Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Atau copy link berikut ke browser:<br/>
              <a href="${verifyLink}">${verifyLink}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
              Link ini berlaku selama 24 jam. Jika kamu tidak merasa mendaftar, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              &copy; 2026 Lalakon. All rights reserved.
            </p>
          </div>
        `,
      });

      this.logger.log(`Email verifikasi terkirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal kirim email ke ${email}:`, error);
      throw error;
    }
  }
}
