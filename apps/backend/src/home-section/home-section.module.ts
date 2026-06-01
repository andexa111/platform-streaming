import { Module } from '@nestjs/common';
import { HomeSectionController } from './home-section.controller';
import { HomeSectionService } from './home-section.service';

@Module({
  controllers: [HomeSectionController],
  providers: [HomeSectionService],
  exports: [HomeSectionService],
})
export class HomeSectionModule {}
