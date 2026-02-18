import React, { memo } from 'react';
import { useGetTrendingTVShows } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';

const NetflixTop10 = memo(function NetflixTop10() {
  const { data: shows, isLoading, isError } = useGetTrendingTVShows();

  if (isLoading) {
    return (
      <section className="px-6 md:px-12">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/assets/generated/netflix-logo-transparent.dim_200x100.png" 
            alt="Netflix" 
            className="h-8 w-auto"
          />
          <h2 className="text-3xl font-bold text-white">Top 10 TV Shows</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !shows || shows.length === 0) {
    return (
      <section className="px-6 md:px-12">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/assets/generated/netflix-logo-transparent.dim_200x100.png" 
            alt="Netflix" 
            className="h-8 w-auto"
          />
          <h2 className="text-3xl font-bold text-white">Top 10 TV Shows</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">
            {isError ? 'Unable to load trending TV shows' : 'No trending TV shows available'}
          </p>
        </div>
      </section>
    );
  }

  const top10Shows = shows.slice(0, 10);

  return (
    <section className="px-6 md:px-12">
      <div className="flex items-center gap-3 mb-6">
        <img 
          src="/assets/generated/netflix-logo-transparent.dim_200x100.png" 
          alt="Netflix" 
          className="h-8 w-auto"
        />
        <h2 className="text-3xl font-bold text-white">Top 10 TV Shows</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {top10Shows.map((show, index) => (
          <div key={show.id} className="relative">
            <div className="absolute -left-2 -top-2 z-10 bg-red-600 text-white font-bold text-2xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              {index + 1}
            </div>
            <MediaCard media={show} />
          </div>
        ))}
      </div>
    </section>
  );
});

export default NetflixTop10;
