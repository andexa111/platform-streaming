import { Metadata } from "next";
import WatchClient from "./WatchClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  if (id === "0") {
    return {
      title: "Sinea Rekap Acara - SINEA",
      description: "Tonton rangkuman keseruan acara Sinea Rekap.",
      openGraph: {
        title: "Sinea Rekap Acara - SINEA",
        description: "Tonton rangkuman keseruan acara Sinea Rekap.",
        images: [{ url: "https://sinea.id/SINEA%20-%20Logo%20Horisontal.webp" }],
      },
    };
  }

  try {
    const res = await fetch(`${backendUrl}/films/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Film not found");
    const film = await res.json();

    const title = `${film.title} - SINEA`;
    const description = film.description || "Tonton film berkualitas di Sinea.";

    let posterUrl = "";
    if (film.poster_url) {
      if (film.poster_url.startsWith("http")) {
        posterUrl = film.poster_url;
      } else if (film.poster_url.startsWith("/") && !film.poster_url.startsWith("/uploads/")) {
        posterUrl = `https://sinea.id${film.poster_url}`;
      } else {
        const cleanUrl = film.poster_url.startsWith("/") ? film.poster_url : `/${film.poster_url}`;
        posterUrl = `${backendUrl}${cleanUrl}`;
      }
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: posterUrl ? [{ url: posterUrl }] : [],
        type: "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: "SINEA - Your Visual Storytellers",
      description: "SINEA - Your Visual Storytellers",
    };
  }
}

export default function Page({ params }: Props) {
  const movieId = parseInt(params.id);
  return <WatchClient movieId={movieId} />;
}
