import { memo } from "react";
import { useGetTrendingTVShows } from "../hooks/useQueries";
import MediaCard from "./MediaCard";
import { Skeleton } from "./ui/skeleton";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.8s linear infinite",
};

const SKELETON_KEYS = Array.from({ length: 10 }, (_, i) => i);

const SectionHeader = () => (
  <div className="flex items-center gap-6 mb-10">
    <div>
      <p
        className="text-xs uppercase tracking-[0.18em] mb-1 font-medium"
        style={{
          color: "oklch(55% 0.16 22)",
          fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
        }}
      >
        Netflix
      </p>
      <h2
        className="text-2xl font-bold text-white"
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        Top 10 TV Shows
      </h2>
    </div>
    {/* Fading rule */}
    <div
      className="flex-1 h-px mt-4"
      style={{
        background:
          "linear-gradient(to right, rgba(255,255,255,0.10), transparent)",
      }}
    />
  </div>
);

const NetflixTop10 = memo(function NetflixTop10() {
  const { data: shows, isLoading, isError } = useGetTrendingTVShows();

  if (isLoading) {
    return (
      <section
        className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
        data-ocid="netflix.section"
      >
        <SectionHeader />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

  if (isError || !shows || shows.length === 0) {
    return (
      <section
        className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
        data-ocid="netflix.section"
      >
        <SectionHeader />
        <div className="text-center py-12" data-ocid="netflix.empty_state">
          <p className="text-white/50 text-base">
            {isError
              ? "Unable to load trending TV shows"
              : "No trending TV shows available"}
          </p>
        </div>
      </section>
    );
  }

  const top10Shows = shows.slice(0, 10);

  return (
    <section
      className="mx-6 md:mx-12 rounded-xl p-6 md:p-8 glass-panel"
      data-ocid="netflix.section"
    >
      <SectionHeader />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {top10Shows.map((show, index) => (
          <div key={show.id} className="relative">
            {/* Giant ghost rank number */}
            <div
              className="absolute -bottom-3 -left-1 z-0 select-none pointer-events-none leading-none font-bold"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "6rem",
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.07)",
                lineHeight: 1,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            {/* Card above ghost number */}
            <div
              className="relative z-10 opacity-0 animate-fade-up"
              style={{
                animationDelay: `${index * 0.06}s`,
                animationFillMode: "forwards",
              }}
            >
              <MediaCard media={show} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default NetflixTop10;
