import { AlertCircle, Info } from 'lucide-react';
import type { ApiHealthStatus } from '../hooks/useQueries';

interface ApiHealthBannerProps {
  status: ApiHealthStatus;
}

export default function ApiHealthBanner({ status }: ApiHealthBannerProps) {
  if (status.isHealthy) return null;

  return (
    <div className="glass-panel border-b border-yellow-500/40 backdrop-blur-md">
      <div className="container py-3">
        <div className="flex items-center gap-3 text-yellow-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-glass">{status.message}</p>
            {!status.hasCustomKey && (
              <p className="text-xs text-yellow-300/90 mt-1">
                <Info className="w-3 h-3 inline mr-1" />
                Using fallback API key. For better reliability, configure your own TMDB API key.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

