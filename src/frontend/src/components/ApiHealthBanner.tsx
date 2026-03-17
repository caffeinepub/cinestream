import { AlertCircle } from "lucide-react";
import React from "react";
import {
  useGetTrendingMovies,
  useGetTrendingTVShows,
} from "../hooks/useQueries";

export default function ApiHealthBanner() {
  const { isError: moviesError } = useGetTrendingMovies();
  const { isError: tvError } = useGetTrendingTVShows();

  const hasApiError = moviesError || tvError;

  if (!hasApiError) {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 backdrop-blur-sm border-b border-yellow-500/20 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-yellow-100 text-sm">
            <strong>TMDB API Connection Issue:</strong> Unable to fetch trending
            content. The service may be temporarily unavailable. Please try
            again later.
          </p>
        </div>
      </div>
    </div>
  );
}
