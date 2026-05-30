import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Sinea <onboarding@resend.dev>';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Kirim email notifikasi: akun disetujui admin
   */
  async sendApprovalEmail(email: string, name: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Akun Anda Disetujui — Sinea',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Selamat, ${name}! 🎉</h2>
            <p>Kabar baik! Akun Sinea Anda telah <strong>disetujui</strong> oleh admin.</p>
            <p>Sekarang Anda dapat login dan mulai menikmati berbagai tayangan eksklusif di platform kami.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/login" 
                 style="background-color: #024D94; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Login Sekarang
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Jika Anda tidak merasa mendaftar, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              &copy; 2026 Sinea. All rights reserved.
            </p>
          </div>
        `,
      });

      this.logger.log(`Email approval terkirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal kirim email approval ke ${email}:`, error);
      throw error;
    }
  }

  /**
   * Kirim email notifikasi: akun ditolak
   */
  async sendRejectionEmail(email: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Pendaftaran Ditolak — Sinea',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Mohon Maaf, ${name}</h2>
            <p>Pendaftaran akun Anda di Sinea <strong>tidak dapat kami setujui</strong> saat ini.</p>
            <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi tim kami untuk informasi lebih lanjut.</p>
            <p style="color: #999; font-size: 12px;">
              Terima kasih atas minat Anda terhadap Sinea.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              &copy; 2026 Sinea. All rights reserved.
            </p>
          </div>
        `,
      });

      this.logger.log(`Email rejection terkirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal kirim email rejection ke ${email}:`, error);
      throw error;
    }
  }

  /**
   * Kirim email reset password
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset Password — Sinea',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Reset Password</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Kami menerima permintaan untuk mereset password akun Sinea kamu. Klik tombol di bawah untuk melanjutkan:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #024D94; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Atau copy link berikut ke browser:<br/>
              <a href="${resetLink}">${resetLink}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
              Link ini berlaku selama 1 jam. Jika kamu tidak meminta reset password, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              &copy; 2026 Sinea. All rights reserved.
            </p>
          </div>
        `,
      });

      this.logger.log(`Email reset password terkirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal kirim email reset password ke ${email}:`, error);
      throw error;
    }
  }

  /**
   * Kirim email support / bantuan ke sinea.hub@gmail.com
   */
  async sendSupportEmail(
    senderName: string,
    senderEmail: string,
    messageContent: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: 'sinea.hub@gmail.com',
        subject: `Pusat Bantuan: Laporan dari ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #024D94; border-bottom: 2px solid #024D94; padding-bottom: 10px; margin-top: 0;">Laporan Pusat Bantuan Baru</h2>
            <p><strong>Nama Pengirim:</strong> ${senderName}</p>
            <p><strong>Email Pengirim:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #024D94;">
              <p style="white-space: pre-wrap; margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${messageContent}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
              Pesan ini dikirimkan secara otomatis dari sistem Pusat Bantuan Sinea.
            </p>
          </div>
        `,
      });

      this.logger.log(`Email support dari ${senderEmail} terkirim ke sinea.hub@gmail.com`);
    } catch (error) {
      this.logger.error(`Gagal kirim email support dari ${senderEmail}:`, error);
      throw error;
    }
  }
}
