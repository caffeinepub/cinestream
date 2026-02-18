import React, { memo } from 'react';
import { useGetTrendingMovies } from '../hooks/useQueries';
import MediaCard from './MediaCard';
import { Skeleton } from './ui/skeleton';

const FeaturedRow = memo(function FeaturedRow() {
  const { data: movies, isLoading, isError } = useGetTrendingMovies();

  if (isLoading) {
    return (
      <section className="px-6 md:px-12">
        <h2 className="text-3xl font-bold text-white mb-6">Trending Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !movies || movies.length === 0) {
    return (
      <section className="px-6 md:px-12">
        <h2 className="text-3xl font-bold text-white mb-6">Trending Movies</h2>
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">
            {isError ? 'Unable to load trending movies' : 'No trending movies available'}
          </p>
        </div>
      </section>
    );
  }

  const displayMovies = movies.slice(0, 12);

  return (
    <section className="px-6 md:px-12">
      <h2 className="text-3xl font-bold text-white mb-6">Trending Movies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayMovies.map((movie) => (
          <MediaCard key={movie.id} media={movie} />
        ))}
      </div>
    </section>
  );
});

export default FeaturedRow;
