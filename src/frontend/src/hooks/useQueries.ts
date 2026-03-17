import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MediaItem } from "../App";
import type { UserProfile } from "../backend";
import { useActor } from "./useActor";

// User Profile Hooks

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Tracked Shows Hooks

export function useGetTrackedShows() {
  const { actor } = useActor();
  return useQuery<string[]>({
    queryKey: ["trackedShows"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getTrackedShows();
      return result;
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addTrackedShow(showId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trackedShows"] }),
  });
}

export function useRemoveTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removeTrackedShow(showId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trackedShows"] }),
  });
}

// TMDB API Hooks

const TMDB_API_KEY = "3d1cb94d909aab088231f5af899dffdc";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TMDBResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export function useGetTrendingMovies() {
  return useQuery<MediaItem[]>({
    queryKey: ["trending", "movies"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`,
        );

        if (!response.ok) {
          throw new Error("TMDB API request failed");
        }

        const data: TMDBResponse = await response.json();

        if (!data.results || data.results.length === 0) {
          const fallbackResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`,
          );

          if (!fallbackResponse.ok) {
            throw new Error("TMDB fallback request failed");
          }

          const fallbackData: TMDBResponse = await fallbackResponse.json();
          return fallbackData.results.map((item) => ({
            ...item,
            media_type: "movie" as const,
          }));
        }

        return data.results.map((item) => ({
          ...item,
          media_type: "movie" as const,
        }));
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useGetTrendingTVShows() {
  return useQuery<MediaItem[]>({
    queryKey: ["trending", "tv"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&language=en-US`,
        );

        if (!response.ok) {
          throw new Error("TMDB API request failed");
        }

        const data: TMDBResponse = await response.json();

        if (!data.results || data.results.length === 0) {
          const fallbackResponse = await fetch(
            `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1`,
          );

          if (!fallbackResponse.ok) {
            throw new Error("TMDB fallback request failed");
          }

          const fallbackData: TMDBResponse = await fallbackResponse.json();
          return fallbackData.results.map((item) => ({
            ...item,
            media_type: "tv" as const,
          }));
        }

        return data.results.map((item) => ({
          ...item,
          media_type: "tv" as const,
        }));
      } catch (error) {
        console.error("Error fetching trending TV shows:", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useGetTrailer(
  mediaType: "movie" | "tv",
  mediaId: number,
  enabled = true,
) {
  return useQuery<string | null>({
    queryKey: ["trailer", mediaType, mediaId],
    queryFn: async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `${TMDB_BASE_URL}/${mediaType}/${mediaId}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
          { signal: controller.signal },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Rate limit exceeded. Please try again in a moment.",
            );
          }
          throw new Error("Failed to fetch trailer");
        }

        const data: TMDBVideosResponse = await response.json();

        const trailer =
          data.results.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official,
          ) ||
          data.results.find(
            (video) => video.site === "YouTube" && video.type === "Trailer",
          ) ||
          data.results.find((video) => video.site === "YouTube");

        return trailer ? trailer.key : null;
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
          }
          throw error;
        }
        throw new Error("Failed to fetch trailer");
      }
    },
    enabled: enabled && !!mediaId,
    staleTime: 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
