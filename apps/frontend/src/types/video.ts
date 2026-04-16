export interface Video {
  id: string | number;
  title: string;
  thumbnail: string;
  genre?: string;
  rating?: string | number;
  quality?: string;
  year?: string | number;
  description?: string;
  backdrop?: string;
}
