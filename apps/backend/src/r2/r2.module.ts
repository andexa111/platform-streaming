import { Global, Module } from '@nestjs/common';
import { R2Service } from './r2.service';

@Global() // Global supaya bisa dipakai di FilmModule, UploadModule, dll
@Module({
  providers: [R2Service],
  exports: [R2Service],
})
export class R2Module {}
