import React from 'react';

export default function Hero() {
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/theater-hero.dim_1200x600.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/60 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
            Trending This Year
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
            Discover the most popular movies and TV shows
          </p>
        </div>
      </div>
    </section>
  );
}
