import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetTrailer } from '../hooks/useQueries';
import { Loader2, AlertCircle, Play } from 'lucide-react';

interface TrailerModalProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TrailerModal({
  mediaType,
  mediaId,
  mediaTitle,
  open,
  onOpenChange,
}: TrailerModalProps) {
  const { data: trailerKey, isLoading, isError, error, refetch } = useGetTrailer(
    mediaType,
    mediaId,
    open
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black/95 backdrop-blur-xl border-white/10"
        style={{ zIndex: 9999 }}
      >
        <DialogHeader className="p-6 pb-4 bg-gradient-to-b from-black/80 to-transparent">
          <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
            <Play className="w-5 h-5 text-red-500" />
            {mediaTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 to-black/70">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
                <p className="text-white/80 text-sm">Loading trailer...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 to-black/70 p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-semibold">Unable to Load Trailer</p>
                  <p className="text-white/60 text-sm">
                    {error instanceof Error ? error.message : 'An error occurred while fetching the trailer.'}
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !isError && !trailerKey && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 to-black/70 p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-white/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-semibold">No Trailer Available</p>
                  <p className="text-white/60 text-sm">
                    A trailer for this {mediaType === 'movie' ? 'movie' : 'show'} is not currently available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && trailerKey && (
            <iframe
              key={trailerKey}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${mediaTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
