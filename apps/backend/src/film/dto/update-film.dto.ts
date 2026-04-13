import { PartialType } from '@nestjs/mapped-types';
import { CreateFilmDto } from './create-film.dto';

// PartialType = semua field dari CreateFilmDto jadi opsional
// Jadi admin bisa update 1 field saja tanpa harus kirim semuanya
export class UpdateFilmDto extends PartialType(CreateFilmDto) {}
