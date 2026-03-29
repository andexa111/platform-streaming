export interface Film {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  duration: number | null;
  release_year: number | null;
  director: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  video_id: string | null;
  is_published: boolean;
  is_deleted: boolean;
  scheduled_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilmCard {
  id: number;
  title: string;
  genre: string | null;
  poster_url: string | null;
  scheduled_at: string | null;
  is_published: boolean;
}
