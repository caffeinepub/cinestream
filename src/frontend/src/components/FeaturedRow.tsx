import { useRef, memo } from 'react';
import { useFeaturedContent, useTrendingContent } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';
import { AlertCircle, Wifi } from 'lucide-react';
import type { MediaItem } from '../App';
import { filterExcludingKeys, getMediaKey } from '../lib/mediaKeys';
import { 
  FEATURED_SPACING_CLASS, 
  SECTION_CONTAINER_CLASS, 
  FEATURED_HEADER_CLASS,
  GLASS_PANEL_CLASS,
  DIVIDER_CLASS 
} from '../lib/sectionTheme';

interface FeaturedRowProps {
  onMediaClick: (media: MediaItem) => void;
}

function FeaturedRow({ onMediaClick }: FeaturedRowProps) {
  const { data: featuredCandidates, isLoading, error, isError } = useFeaturedContent();
  const { data: trendingContent } = useTrendingContent();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <section className="relative my-12">
        <div className={DIVIDER_CLASS + ' mb-12'} />
        
        <div className="relative py-16">
          <div className={SECTION_CONTAINER_CLASS}>
            <div className="mb-10">
              <h2 className={FEATURED_HEADER_CLASS}>Featured</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 space-y-3">
                  <Skeleton className={`aspect-[2/3] w-full rounded-xl ${GLASS_PANEL_CLASS}`} />
                  <Skeleton className={`h-5 w-3/4 ${GLASS_PANEL_CLASS} rounded-lg`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className={DIVIDER_CLASS + ' mt-12'} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="relative my-12">
        <div className={DIVIDER_CLASS + ' mb-12'} />
        
        <div className="relative py-16">
          <div className={SECTION_CONTAINER_CLASS}>
            <div className="mb-10">
              <h2 className={FEATURED_HEADER_CLASS}>Featured</h2>
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
        
        <div className={DIVIDER_CLASS + ' mt-12'} />
      </section>
    );
  }

  // Build exclusion set from Trending content
  const trendingKeys = new Set<string>();
  if (trendingContent) {
    trendingContent.forEach(item => {
      trendingKeys.add(getMediaKey(item));
    });
  }

  // Filter featured candidates to exclude items in Trending, backfill to 12
  const content = featuredCandidates 
    ? filterExcludingKeys(featuredCandidates, trendingKeys, 12)
    : [];

  if (content.length === 0) {
    return null;
  }

  return (
    <section className="relative my-12 featured-row-optimized">
      <div className={DIVIDER_CLASS + ' mb-12'} />
      
      <div className={`relative ${FEATURED_SPACING_CLASS}`}>
        <div className="container px-6 md:px-8 lg:px-12">
          <div className="mb-10">
            <h2 className={FEATURED_HEADER_CLASS}>Featured</h2>
          </div>
          
          <div className="relative">
            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            >
              {content.map((item) => (
                <div key={getMediaKey(item)} className="flex-shrink-0 w-64">
                  <MediaCard media={item} onClick={() => onMediaClick(item)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className={DIVIDER_CLASS + ' mt-12'} />
    </section>
  );
}

export default memo(FeaturedRow);
