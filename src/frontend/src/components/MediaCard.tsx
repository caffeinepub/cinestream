import { Play } from "lucide-react";
import type React from "react";
import { memo, useState } from "react";
import type { MediaItem } from "../App";
import TrailerModal from "./TrailerModal";

interface MediaCardProps {
  media: MediaItem;
}

const MediaCard = memo(function MediaCard({ media }: MediaCardProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const title = media.title || media.name || "Untitled";
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : "/assets/generated/film-reel-transparent.dim_64x64.png";

  const rating = media.vote_average ? media.vote_average.toFixed(1) : "N/A";

  const handleWatchTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrailerOpen(true);
  };

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl"
        style={{
          border: hovered
            ? "1px solid rgba(200,70,50,0.30)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: hovered
            ? "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,70,50,0.25)"
            : "0 4px 20px rgba(0,0,0,0.40)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition:
            "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease",
          zIndex: hovered ? 10 : undefined,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-ocid="trending.item.1"
      >
        <div
          className="aspect-[2/3] relative"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.08) 100%)",
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span
                    className="text-xs font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(88% 0.08 85) 0%, oklch(72% 0.10 75) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ★
                  </span>
                  <span className="text-white/90 text-xs font-medium">
                    {rating}
                  </span>
                </div>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded text-white/60 glass-card">
                  {media.media_type}
                </span>
              </div>
              <button
                type="button"
                onClick={handleWatchTrailer}
                data-ocid="trending.open_modal_button"
                className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:brightness-110"
                style={{
                  background: "rgba(180,40,30,0.85)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 16px rgba(180,40,30,0.30)",
                }}
              >
                <Play className="w-3.5 h-3.5" />
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        mediaType={media.media_type}
        mediaId={media.id}
        mediaTitle={title}
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
      />
    </>
  );
});

export default MediaCard;
