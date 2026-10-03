import { Module } from '@nestjs/common';
import { BannerAdService } from './banner-ad.service';
import { BannerAdController } from './banner-ad.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BannerAdController],
  providers: [BannerAdService],
  exports: [BannerAdService],
})
export class BannerAdModule {}
