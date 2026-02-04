import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/20 glass-panel mt-24">
      <div className="container py-6 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-white/80 text-center md:text-left">
            <p className="text-glass">© 2025. Built with <Heart className="inline w-3.5 h-3.5 text-primary fill-primary" /> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
          
          <div className="text-xs text-white/60 text-center md:text-right">
            <p className="text-glass">
              Movie data provided by{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white/70 hover:text-primary transition-colors"
              >
                TMDB
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

