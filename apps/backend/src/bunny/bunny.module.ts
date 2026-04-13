import { Global, Module } from '@nestjs/common';
import { BunnyService } from './bunny.service';

@Global() // Global supaya bisa dipakai di FilmModule, UploadModule, dll
@Module({
  providers: [BunnyService],
  exports: [BunnyService],
})
export class BunnyModule {}
