import { X, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { useGetTrackedShowsDetails, useRemoveTrackedShow, getImageUrl, useUpdateLastVisit } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import AddShowDialog from './AddShowDialog';
import { useEffect } from 'react';

export default function TrackedShows() {
  const { data: trackedShows = [], isLoading, error, isError } = useGetTrackedShowsDetails();
  const removeShowMutation = useRemoveTrackedShow();
  const updateLastVisitMutation = useUpdateLastVisit();

  useEffect(() => {
    updateLastVisitMutation.mutate();
  }, []);

  const handleRemove = async (showId: number, showTitle: string) => {
    try {
      await removeShowMutation.mutateAsync(showId.toString());
      toast.success(`Removed "${showTitle}" from tracked list`);
    } catch (error: any) {
      console.error('Failed to remove show:', error);
      const errorMessage = error?.message || 'Failed to remove show';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No air date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="glass-panel border-b border-white/20">
      <div className="container py-8 px-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white tracking-tight text-glass">Tracked Shows</h2>
              <AddShowDialog />
            </div>
            <span className="text-sm text-white/70 font-medium text-glass">
              {isLoading ? '...' : `${trackedShows.length} show${trackedShows.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl glass-panel animate-shimmer" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-white/20 rounded-xl glass-panel glass-shadow">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-sm text-white/80 mb-2 text-glass">
                Unable to load tracked shows
              </p>
              {error && (
                <p className="text-xs text-white/60 text-glass">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              )}
            </div>
          ) : trackedShows.length > 0 ? (
            <div className="space-y-4">
              {trackedShows.map((show) => (
                <div
                  key={show.id}
                  className="glass-panel-strong glass-shadow rounded-xl p-5 hover-lift transition-all duration-300 border-white/20 hover:border-white/30 glass-glow luminous-highlight"
                >
                  <div className="flex gap-5">
                    <div className="shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-black/30 relative glass-shadow">
                      <img
                        src={getImageUrl(show.posterPath, 'w500')}
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                      {show.hasNewEpisode && (
                        <div className="absolute -top-1 -right-1">
                          <img
                            src="/assets/generated/new-episode-star.dim_24x24.png"
                            alt="New episode"
                            className="w-6 h-6 animate-bounce"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base line-clamp-2 leading-tight text-white text-glass">
                            {show.title}
                          </h3>
                          {show.hasNewEpisode && (
                            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:glass-panel text-white/70 hover:text-white rounded-lg transition-all duration-300 hover:scale-110 backdrop-blur-md"
                          onClick={() => handleRemove(show.id, show.title)}
                          disabled={removeShowMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="text-glass">
                          Last episode: {formatDate(show.lastAirDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/30 rounded-xl glass-panel glass-shadow">
              <p className="text-sm text-white/80 mb-4 text-glass">
                No tracked shows yet
              </p>
              <AddShowDialog />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
