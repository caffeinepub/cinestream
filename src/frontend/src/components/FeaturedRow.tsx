import { memo } from "react";
import { useGetTrendingMovies } from "../hooks/useQueries";
import MediaCard from "./MediaCard";
import { Skeleton } from "./ui/skeleton";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.8s linear infinite",
};

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => i);

const SectionHeader = () => (
  <div className="flex items-center gap-6 mb-10">
    <div>
      <p
        className="text-xs uppercase tracking-[0.18em] mb-1 font-medium"
        style={{
          color: "oklch(60% 0.008 80)",
          fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
        }}
      >
        Trending Now
      </p>
      <h2
        className="text-2xl font-bold text-white"
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        Trending Movies
      </h2>
    </div>
    <div
      className="flex-1 h-px mt-4"
      style={{
        background:
          "linear-gradient(to right, rgba(255,255,255,0.10), transparent)",
      }}
    />
    <span
      className="text-xs mt-4 flex-shrink-0"
      style={{
        color: "rgba(255,255,255,0.25)",
        fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      Updated every 30 min
    </span>
  </div>
);

const FeaturedRow = memo(function FeaturedRow() {
  const { data: movies, isLoading, isError } = useGetTrendingMovies();

  if (isLoading) {
    return (
      <section
        className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
        data-ocid="featured.section"
      >
        <SectionHeader />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {SKELETON_KEYS.map((k) => (
            <Skeleton
              key={k}
              className="aspect-[2/3] rounded-xl"
              style={shimmerStyle}
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !movies || movies.length === 0) {
    return (
      <section
        className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
        data-ocid="featured.section"
      >
        <SectionHeader />
        <div className="text-center py-12" data-ocid="featured.empty_state">
          <p className="text-white/50 text-base">
            {isError
              ? "Unable to load trending movies"
              : "No trending movies available"}
          </p>
        </div>
      </section>
    );
  }

  const displayMovies = movies.slice(0, 12);

  return (
    <section
      className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
      data-ocid="featured.section"
    >
      <SectionHeader />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="opacity-0 animate-fade-up"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: "forwards",
            }}
          >
            <MediaCard media={movie} />
          </div>
        ))}
      </div>
    </section>
  );
});

export default FeaturedRow;
