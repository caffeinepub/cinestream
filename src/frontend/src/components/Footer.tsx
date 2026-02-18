import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'unknown-app';

  return (
    <footer className="border-t border-white/10 bg-[#1a1a2e]/80 backdrop-blur-sm">
      <div className="container py-6 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/70">
            © {currentYear}. Built with <Heart className="inline w-4 h-4 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-white/50">
            Movie data provided by{' '}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white/90 transition-colors underline"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
