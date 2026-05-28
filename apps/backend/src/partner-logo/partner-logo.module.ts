import { Module } from '@nestjs/common';
import { PartnerLogoController } from './partner-logo.controller';
import { PartnerLogoService } from './partner-logo.service';

@Module({
  controllers: [PartnerLogoController],
  providers: [PartnerLogoService],
})
export class PartnerLogoModule {}
