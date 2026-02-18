import React from 'react';
import { useTrendingContent } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';
import type { MediaItem } from '../App';
import { selectUniqueMedia, getMediaKey } from '../lib/mediaKeys';
import { 
  SECTION_SPACING_CLASS, 
  SECTION_CONTAINER_CLASS, 
  NETFLIX_GRID_CLASS,
  GLASS_PANEL_CLASS 
} from '../lib/sectionTheme';

interface NetflixTop10Props {
  onMediaClick: (media: MediaItem) => void;
}

export default function NetflixTop10({ onMediaClick }: NetflixTop10Props) {
  const { data: content, isLoading } = useTrendingContent();

  if (isLoading) {
    return (
      <section className={SECTION_SPACING_CLASS}>
        <div className={SECTION_CONTAINER_CLASS}>
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/assets/generated/netflix-logo-transparent.dim_200x100.png"
              alt="Netflix"
              className="h-8"
            />
            <h2 className="text-3xl font-bold text-white text-glass-strong">Netflix Top 10</h2>
          </div>
          <div className={NETFLIX_GRID_CLASS}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className={`aspect-[2/3] rounded-xl ${GLASS_PANEL_CLASS}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Deduplicate and select top 10 unique items
  const top10 = content ? selectUniqueMedia(content, 10) : [];

  if (top10.length === 0) return null;

  return (
    <section className={SECTION_SPACING_CLASS}>
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/assets/generated/netflix-logo-transparent.dim_200x100.png"
            alt="Netflix"
            className="h-8"
          />
          <h2 className="text-3xl font-bold text-white text-glass-strong">Netflix Top 10</h2>
        </div>
        <div className={NETFLIX_GRID_CLASS}>
          {top10.map((item, index) => (
            <div key={getMediaKey(item)} className="relative">
              <div className="absolute -top-2 -left-2 z-10 w-12 h-12 rounded-full glass-panel-strong flex items-center justify-center border-2 border-white/30 glass-shadow-lg">
                <span className="text-2xl font-bold text-white text-glass-strong">{index + 1}</span>
              </div>
              <MediaCard media={item} onClick={() => onMediaClick(item)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
