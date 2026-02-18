import React, { memo, useState } from 'react';
import type { MediaItem } from '../App';
import TrailerModal from './TrailerModal';
import { Play } from 'lucide-react';

interface MediaCardProps {
  media: MediaItem;
}

const MediaCard = memo(function MediaCard({ media }: MediaCardProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  
  const title = media.title || media.name || 'Untitled';
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/assets/generated/film-reel-transparent.dim_64x64.png';

  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';

  const handleWatchTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrailerOpen(true);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-10">
        <div className="aspect-[2/3] relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              <h3 className="text-white font-semibold text-sm line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white text-xs">{rating}</span>
                </div>
                <span className="text-white/60 text-xs uppercase">
                  {media.media_type}
                </span>
              </div>
              <button
                onClick={handleWatchTrailer}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                <Play className="w-4 h-4" />
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
