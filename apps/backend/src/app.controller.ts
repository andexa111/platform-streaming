import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
