import { useRef, useCallback, memo } from 'react';
import { useFeaturedContent } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, Wifi } from 'lucide-react';
import type { MediaItem } from '../App';

interface FeaturedRowProps {
  onMediaClick: (media: MediaItem) => void;
}

function FeaturedRow({ onMediaClick }: FeaturedRowProps) {
  const { data: content, isLoading, error, isError } = useFeaturedContent();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  if (isLoading) {
    return (
      <section className="relative my-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />
        
        <div className="relative py-16">
          <div className="container px-6">
            <div className="mb-10">
              <h2 className="text-5xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong">Featured</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl glass-panel animate-shimmer" />
                  <Skeleton className="h-5 w-3/4 glass-panel rounded-lg animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-12" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="relative my-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />
        
        <div className="relative py-16">
          <div className="container px-6">
            <div className="mb-10">
              <h2 className="text-5xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong">Featured</h2>
            </div>
            <div className="flex items-center justify-center py-16 text-center">
              <div className="space-y-4 glass-panel glass-shadow-lg rounded-2xl p-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <Wifi className="w-6 h-6 text-white/50 absolute -bottom-1 -right-1" />
                  </div>
                </div>
                <p className="text-white/90 text-lg text-glass">Unable to load featured content</p>
                <p className="text-sm text-white/70 max-w-md text-glass">
                  Check your connection or try refreshing the page
                </p>
                {error && (
                  <details className="text-xs text-white/60 mt-2">
                    <summary className="cursor-pointer hover:text-white/80">Details</summary>
                    <p className="mt-1">
                      {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-12" />
      </section>
    );
  }

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <section className="relative my-12 featured-row-optimized">
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />
      
      <div className="relative py-16">
        <div className="container px-6 md:px-8 lg:px-12">
          <div className="mb-10">
            <h2 className="text-5xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong">Featured</h2>
          </div>
          
          <div className="relative group">
            {/* Left Navigation Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-28 w-12 rounded-xl glass-panel-strong hover:glass-panel opacity-0 group-hover:opacity-100 transition-all duration-300 glass-shadow-lg hover:scale-105 neon-glow border border-white/20 hover:border-white/40 md:block hidden will-change-transform"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-7 w-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            </Button>
            
            {/* Right Navigation Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-28 w-12 rounded-xl glass-panel-strong hover:glass-panel opacity-0 group-hover:opacity-100 transition-all duration-300 glass-shadow-lg hover:scale-105 neon-glow border border-white/20 hover:border-white/40 md:block hidden will-change-transform"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-7 w-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            </Button>

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {content.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="flex-shrink-0 w-64"
                >
                  <MediaCard
                    media={item}
                    onClick={() => onMediaClick(item)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-12" />
    </section>
  );
}

export default memo(FeaturedRow);
