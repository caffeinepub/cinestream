import React from 'react';

export default function Hero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/assets/generated/theater-hero.dim_1200x600.jpg"
          alt="Theater background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container relative z-10 px-6 text-center">
        <h1 className="text-6xl font-bold text-white mb-4 text-glass-strong animate-fade-in">
          Discover Trending Content
        </h1>
        <p className="text-xl text-white/80 text-glass">
          Explore the hottest movies and TV shows from the past year
        </p>
      </div>
    </section>
  );
}
