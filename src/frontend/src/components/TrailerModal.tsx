import { useEffect, useState, useCallback, memo } from 'react';
import { X, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useTrailer, getImageUrl } from '../hooks/useQueries';
import { devLog } from '../lib/devDiagnostics';
import type { MediaItem } from '../App';

interface TrailerModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function TrailerModal({ media, isOpen, onClose }: TrailerModalProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const { data: trailerResult, isLoading, refetch, isFetching } = useTrailer(
    media?.id || null,
    media?.media_type || null,
    isOpen
  );

  // Log modal lifecycle in development
  useEffect(() => {
    if (isOpen && media) {
      devLog.trailerModal('opened', {
        mediaId: media.id,
        mediaType: media.media_type,
      });
    } else if (!isOpen && media) {
      devLog.trailerModal('closed', {
        mediaId: media.id,
        mediaType: media.media_type,
      });
    }
  }, [isOpen, media]);

  // Log trailer result state in development
  useEffect(() => {
    if (trailerResult && media) {
      devLog.trailerResult(trailerResult.status, {
        mediaId: media.id,
        mediaType: media.media_type,
        errorType: trailerResult.status === 'error' ? trailerResult.errorType : undefined,
      });
    }
  }, [trailerResult, media]);

  // Force iframe remount when modal closes to stop playback
  useEffect(() => {
    if (!isOpen) {
      setIframeKey((prev) => prev + 1);
      devLog.iframeLifecycle('unmounted', { reason: 'modal-closed' });
    }
  }, [isOpen]);

  // Force iframe remount when modal opens to ensure clean state
  useEffect(() => {
    if (isOpen) {
      setIframeKey((prev) => prev + 1);
    }
  }, [isOpen]);

  // Log iframe mount in development
  useEffect(() => {
    if (isOpen && trailerResult?.status === 'success') {
      devLog.iframeLifecycle('mounted', {
        mediaId: media?.id,
        mediaType: media?.media_type,
      });
    }
  }, [isOpen, trailerResult, media]);

  const handleRetry = useCallback(() => {
    devLog.trailerModal('retry-requested', {
      mediaId: media?.id,
      mediaType: media?.media_type,
    });
    refetch();
  }, [refetch, media]);

  if (!media) return null;

  const title = media.title || media.name || 'Untitled';
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

  const trailerKey = trailerResult?.status === 'success' ? trailerResult.key : null;
  const isError = trailerResult?.status === 'error';
  const isNoTrailer = trailerResult?.status === 'no-trailer';
  const showLoading = isLoading || isFetching;

  // Error message based on error type
  const getErrorMessage = () => {
    if (!isError || trailerResult.status !== 'error') return '';
    
    switch (trailerResult.errorType) {
      case 'rate-limit':
        return 'TMDB API rate limit reached. Please try again in a few moments.';
      case 'timeout':
        return 'Request timed out. Please check your connection and try again.';
      case 'network':
        return 'Network error. Please check your internet connection.';
      case 'invalid-key':
        return 'Invalid API key. Please check your TMDB API configuration.';
      default:
        return 'Unable to load trailer at this time. Please try again later.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden glass-panel-strong border-white/30 glass-shadow-xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 glass-panel-strong relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <DialogTitle className="text-3xl font-bold text-white tracking-tight text-glass-strong">{title}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="font-medium text-glass">{year}</span>
                <span>•</span>
                <span className="capitalize font-medium text-glass">{media.media_type}</span>
                {media.vote_average > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-glass">{media.vote_average.toFixed(1)}/10</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full glass-panel hover:glass-panel-strong text-white/80 hover:text-white transition-all"
              aria-label="Close trailer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-5 glass-panel-strong">
          {showLoading && (
            <div className="aspect-video glass-panel rounded-xl flex items-center justify-center glass-shadow">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-white/70" />
                <p className="text-sm text-white/60 text-glass">Loading trailer...</p>
              </div>
            </div>
          )}

          {!showLoading && trailerKey && isOpen && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 glass-shadow-lg">
              <iframe
                key={`trailer-${media.id}-${trailerKey}-${iframeKey}`}
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {!showLoading && isNoTrailer && (
            <div className="aspect-video rounded-xl overflow-hidden relative">
              <img
                src={getImageUrl(media.backdrop_path || media.poster_path, 'w780')}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 glass-panel-strong flex items-center justify-center backdrop-blur-md">
                <Alert className="max-w-md glass-panel-strong border-white/30 rounded-xl glass-shadow">
                  <AlertCircle className="h-4 w-4 text-white/80" />
                  <AlertDescription className="text-white/90 text-glass">
                    No trailer available for this {media.media_type}.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {!showLoading && isError && (
            <div className="aspect-video rounded-xl overflow-hidden relative">
              <img
                src={getImageUrl(media.backdrop_path || media.poster_path, 'w780')}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 glass-panel-strong flex items-center justify-center backdrop-blur-md">
                <Alert className="max-w-md glass-panel-strong border-white/30 rounded-xl glass-shadow">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="space-y-3">
                    <p className="text-white/90 text-glass">{getErrorMessage()}</p>
                    <Button
                      onClick={handleRetry}
                      size="sm"
                      variant="outline"
                      className="glass-panel hover:glass-panel-strong border-white/30 text-white"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {media.overview && (
            <div className="space-y-3">
              <h4 className="font-semibold text-base text-white text-glass">Overview</h4>
              <p className="text-sm text-white/80 leading-relaxed text-glass">
                {media.overview}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(TrailerModal);
