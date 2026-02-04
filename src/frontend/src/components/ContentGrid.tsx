import { memo } from 'react';
import { useTrendingContent } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';
import { AlertCircle, Wifi } from 'lucide-react';
import type { MediaItem } from '../App';

interface ContentGridProps {
  onMediaClick: (media: MediaItem) => void;
}

function ContentGrid({ onMediaClick }: ContentGridProps) {
  const { data: content, isLoading, error, isError } = useTrendingContent();

  if (isLoading) {
    return (
      <div className="container py-16 px-6">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong">Trending This Year</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-xl glass-panel animate-shimmer" />
              <Skeleton className="h-4 w-3/4 glass-panel rounded-lg animate-shimmer" />
              <Skeleton className="h-3 w-1/2 glass-panel rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-24 px-6">
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <div className="relative glass-panel glass-shadow-lg rounded-full p-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <Wifi className="w-8 h-8 text-white/50 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-white text-glass-strong">Unable to Load Content</h3>
          <p className="text-white/80 max-w-md mx-auto text-glass">
            We're having trouble connecting to the movie database. This could be due to:
          </p>
          <ul className="text-sm text-white/70 max-w-md mx-auto text-left list-disc list-inside space-y-1 glass-panel glass-shadow rounded-xl p-6">
            <li className="text-glass">Network connectivity issues</li>
            <li className="text-glass">TMDB API rate limiting</li>
            <li className="text-glass">Invalid or missing API key</li>
          </ul>
          <p className="text-sm text-white/80 mt-4 text-glass">
            Please check your internet connection and try refreshing the page.
          </p>
          {error && (
            <details className="text-xs text-white/60 mt-4 max-w-md mx-auto">
              <summary className="cursor-pointer hover:text-white/80">Technical details</summary>
              <p className="mt-2 text-left glass-panel glass-shadow p-3 rounded-lg">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="container py-24 px-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-white text-glass-strong">No Content Available</h3>
          <p className="text-white/80 text-glass">
            No trending content is available at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16 px-6 content-grid-optimized">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong">Trending This Year</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {content.map((item) => (
          <MediaCard
            key={`${item.media_type}-${item.id}`}
            media={item}
            onClick={() => onMediaClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(ContentGrid);
