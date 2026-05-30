import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('support')
  async sendSupport(@Body() body: { name: string; email: string; message: string }) {
    await this.mailService.sendSupportEmail(body.name, body.email, body.message);
    return { success: true, message: 'Laporan Anda berhasil dikirim' };
  }

  @Get('debug-files')
  debugFiles() {
    const fs = require('fs');
    const path = require('path');
    const getFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir).map((file: string) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        return {
          name: file,
          size: stat.size,
          createdAt: stat.birthtime,
        };
      });
    };
    return {
      cwd: process.cwd(),
      posters: getFiles(path.join(process.cwd(), 'public/uploads/posters')),
      trailers: getFiles(path.join(process.cwd(), 'public/uploads/trailers')),
    };
  }
}
