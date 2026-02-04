import { memo, useCallback } from 'react';
import { Star, Calendar, Play, Plus, Check } from 'lucide-react';
import { getImageUrl, useAddTrackedShow, useGetTrackedShows } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { MediaItem } from '../App';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
}

function MediaCard({ media, onClick }: MediaCardProps) {
  const { identity } = useInternetIdentity();
  const { data: trackedShowIds } = useGetTrackedShows();
  const addShowMutation = useAddTrackedShow();
  
  const title = media.title || media.name || 'Untitled';
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const posterUrl = getImageUrl(media.poster_path, 'w500');
  
  const isAuthenticated = !!identity;
  const isTracked = trackedShowIds?.includes(media.id.toString()) || false;

  const handleAddToTracked = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (media.media_type !== 'tv') return;
    
    if (!isAuthenticated) {
      toast.error('Please log in to track shows');
      return;
    }
    
    if (!isTracked) {
      try {
        await addShowMutation.mutateAsync(media.id.toString());
        toast.success(`Added "${title}" to tracked list`);
      } catch (error) {
        console.error('Failed to add show:', error);
        toast.error('Failed to add show');
      }
    }
  }, [media.media_type, media.id, isAuthenticated, isTracked, addShowMutation, title]);

  const handleCardClick = useCallback(() => {
    try {
      onClick();
    } catch (error) {
      console.error('Error opening trailer:', error);
      toast.error('Unable to open trailer');
    }
  }, [onClick]);

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden glass-panel glass-shadow transition-all duration-300 hover:scale-105 hover-lift glass-glow luminous-highlight will-change-transform"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-black/30">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/generated/film-reel-transparent.dim_64x64.png';
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 flex items-center gap-2 text-white bg-primary glass-shadow-lg neon-glow px-5 py-2.5 rounded-full backdrop-blur-md">
            <Play className="w-5 h-5" fill="currentColor" />
            <span className="text-sm font-semibold text-glass">Watch Trailer</span>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="absolute top-3 right-3 text-xs font-semibold glass-panel border-white/30 text-white rounded-lg px-2.5 py-1 glass-shadow"
        >
          {media.media_type === 'movie' ? 'Movie' : 'TV'}
        </Badge>

        {media.vote_average > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 glass-panel border-white/30 px-2.5 py-1 rounded-lg glass-shadow">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white text-glass">
              {media.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {media.media_type === 'tv' && isAuthenticated && (
          <Button
            size="icon"
            variant={isTracked ? "secondary" : "default"}
            className={`absolute bottom-3 right-3 h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-300 border-white/30 rounded-full glass-shadow ${
              isTracked 
                ? 'glass-panel hover:glass-panel-strong text-white' 
                : 'bg-primary hover:bg-primary/90 text-white neon-glow'
            }`}
            onClick={handleAddToTracked}
            disabled={isTracked || addShowMutation.isPending}
          >
            {isTracked ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="p-4 space-y-2 glass-panel-strong">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[2.5rem] text-white text-glass">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-white/80">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-glass">{year}</span>
        </div>

        {media.overview && (
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed text-glass">
            {media.overview}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(MediaCard);
