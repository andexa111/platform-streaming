import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFilmDto {
  @IsString()
  @MinLength(1, { message: 'Judul film wajib diisi' })
  @MaxLength(200, { message: 'Judul film maksimal 200 karakter' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  producer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  director?: string;

  @IsOptional()
  @IsInt({ message: 'Durasi harus berupa angka (menit)' })
  @Min(1, { message: 'Durasi minimal 1 menit' })
  @Type(() => Number)
  duration?: number;

  @IsOptional()
  @IsInt({ message: 'Tahun rilis harus berupa angka' })
  @Min(1900)
  @Type(() => Number)
  release_year?: number;

  @IsOptional()
  @IsString()
  poster_url?: string;

  @IsOptional()
  @IsString()
  trailer_url?: string;

  @IsOptional()
  @IsString()
  video_id?: string; // Bunny Stream video ID

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  scheduled_at?: string; // ISO date string

  @IsOptional()
  @IsArray()
  @IsInt({ each: true, message: 'Genre ID harus berupa angka' })
  genreIds?: number[]; // Array of genre IDs

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Nama aktor harus berupa string' })
  actorNames?: string[]; // Array of actor names
}
