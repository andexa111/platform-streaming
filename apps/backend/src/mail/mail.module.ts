import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // Export supaya AuthModule bisa pakai
})
export class MailModule {}
