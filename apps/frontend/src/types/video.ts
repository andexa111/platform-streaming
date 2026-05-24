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
  director?: string;
  producer?: string;
  actors?: string[];
  releaseYear?: string | number;
  trailerUrl?: string;
  productionHouse?: string;
  productionHouseLogo?: string;
  director?: string;
  producer?: string;
  releaseYear?: string | number;
  actors?: string[];
  clipStart?: number;
  clipEnd?: number;
}
