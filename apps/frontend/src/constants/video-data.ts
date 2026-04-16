import { Video } from "@/types/video";

export const ALL_MOVIES: Video[] = [
  { 
    id: 1, 
    title: "The Midnight Journey", 
    genre: "Action", 
    rating: "4.8", 
    quality: "4K", 
    thumbnail: "",
    backdrop: "",
    description: "In a world where every step could be your last, a lone traveler embarks on a quest to find the lost city of light before the eternal darkness consumes everything."
  },
  { 
    id: 2, 
    title: "Cyber Genesis", 
    genre: "Sci-Fi", 
    rating: "4.9", 
    quality: "HDR", 
    thumbnail: "",
    backdrop: "",
    description: "The year is 2099. Artificial intelligence has surpassed human consciousness. A rogue programmer discovers a hidden protocol that could change the fate of humanity forever."
  },
  { 
    id: 3, 
    title: "The Silent Forest", 
    genre: "Horror", 
    rating: "4.5", 
    quality: "HD+", 
    thumbnail: "",
    backdrop: "",
    description: "Something ancient stirs beneath the trees. When a group of hikers goes missing, a local ranger must face her deepest fears to uncover the truth about the forest that doesn't speak."
  },
  { 
    id: 4, 
    title: "Stellar Waves", 
    genre: "Documentary", 
    rating: "4.7", 
    quality: "4K", 
    thumbnail: "",
    backdrop: "",
    description: "Experience the universe like never before. From the birth of galaxies to the mysterious power of black holes, explore the breathtaking beauty of our cosmic neighborhood."
  },
  { 
    id: 5, 
    title: "Neon Nights", 
    genre: "Thriller", 
    rating: "4.6", 
    quality: "4K", 
    thumbnail: "",
    backdrop: "",
    description: "A high-stakes game of cat and mouse unfolds in the rain-soaked streets of a cyberpunk metropolis. A detective with a past must catch a killer who leaves no trace."
  },
  { 
    id: 6, 
    title: "Outer Rim", 
    genre: "Adventure", 
    rating: "4.4", 
    quality: "HDR", 
    thumbnail: "",
    backdrop: "",
    description: "Beyond the known stars lies a frontier of endless possibilities. A crew of explorers seeks a new home for the last of their kind in the farthest reaches of space."
  },
];

export const GENRES = [
  { title: "Action", emoji: "🔥", color: "from-red-600/20" },
  { title: "Sci-Fi", emoji: "👽", color: "from-indigo-600/20" },
  { title: "Drama", emoji: "🎭", color: "from-emerald-600/20" },
  { title: "Horror", emoji: "👻", color: "from-zinc-800/20" },
  { title: "Documentary", emoji: "🌍", color: "from-brand/20" },
  { title: "Fantasy", emoji: "🪄", color: "from-purple-600/20" },
  { title: "Crime", emoji: "🕵️", color: "from-orange-600/20" },
];
