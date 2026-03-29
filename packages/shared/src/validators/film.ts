import { z } from 'zod';

export const createFilmSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul film wajib diisi')
    .max(255, 'Judul film maksimal 255 karakter'),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter')
    .optional(),
  genre: z
    .string()
    .max(100, 'Genre maksimal 100 karakter')
    .optional(),
  duration: z
    .number()
    .int()
    .positive('Durasi harus positif')
    .optional(),
  release_year: z
    .number()
    .int()
    .min(1900, 'Tahun rilis tidak valid')
    .max(2100, 'Tahun rilis tidak valid')
    .optional(),
  director: z
    .string()
    .max(100, 'Nama sutradara maksimal 100 karakter')
    .optional(),
  trailer_url: z
    .string()
    .url('URL trailer tidak valid')
    .optional()
    .or(z.literal('')),
  scheduled_at: z
    .string()
    .datetime({ message: 'Format tanggal tidak valid' })
    .optional()
    .or(z.literal('')),
});

export type CreateFilmInput = z.infer<typeof createFilmSchema>;
