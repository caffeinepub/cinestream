import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { MediaItem } from '../App';
import type { UserProfile } from '../backend';
import { devLog } from '../lib/devDiagnostics';

// Use environment variable with fallback - ensure it's always defined
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b89fc45c2067cbd33560270639722eae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Check if API key is available (not just the fallback)
const hasCustomApiKey = !!import.meta.env.VITE_TMDB_API_KEY;

// API health status
let apiHealthStatus: 'unknown' | 'healthy' | 'unhealthy' = 'unknown';
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export interface TrackedShow {
  id: number;
  title: string;
}

export interface TrackedShowDetails extends TrackedShow {
  lastAirDate: string | null;
  posterPath: string | null;
  hasNewEpisode: boolean;
}

export interface SearchResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string | null;
}

export interface ApiHealthStatus {
  isHealthy: boolean;
  hasCustomKey: boolean;
  lastChecked: number;
  message: string;
}

// Trailer result type to distinguish no-trailer from errors
export type TrailerResult = 
  | { status: 'success'; key: string }
  | { status: 'no-trailer' }
  | { status: 'error'; errorType: 'rate-limit' | 'timeout' | 'network' | 'invalid-key' | 'unknown' };

// Get date one year ago
function getOneYearAgo(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
}

// Get today's date
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to create a fetch with timeout using AbortController
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Verify TMDB API connectivity
async function verifyTMDBConnection(): Promise<ApiHealthStatus> {
  const now = Date.now();
  
  // Return cached status if checked recently
  if (apiHealthStatus !== 'unknown' && now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return {
      isHealthy: apiHealthStatus === 'healthy',
      hasCustomKey: hasCustomApiKey,
      lastChecked: lastHealthCheck,
      message: apiHealthStatus === 'healthy' 
        ? 'TMDB API is accessible' 
        : 'TMDB API is currently unavailable',
    };
  }

  try {
    const response = await fetchWithTimeout(
      `${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`,
      5000 // 5 second timeout
    );
    
    if (response.ok) {
      apiHealthStatus = 'healthy';
      lastHealthCheck = now;
      console.log('[TMDB] API connection verified successfully');
      return {
        isHealthy: true,
        hasCustomKey: hasCustomApiKey,
        lastChecked: now,
        message: hasCustomApiKey 
          ? 'Using custom TMDB API key' 
          : 'Using fallback TMDB API key',
      };
    } else if (response.status === 401) {
      apiHealthStatus = 'unhealthy';
      lastHealthCheck = now;
      console.error('[TMDB] Invalid API key');
      return {
        isHealthy: false,
        hasCustomKey: hasCustomApiKey,
        lastChecked: now,
        message: 'Invalid TMDB API key - please check your configuration',
      };
    } else {
      apiHealthStatus = 'unhealthy';
      lastHealthCheck = now;
      console.error(`[TMDB] API returned status ${response.status}`);
      return {
        isHealthy: false,
        hasCustomKey: hasCustomApiKey,
        lastChecked: now,
        message: `TMDB API error: ${response.status}`,
      };
    }
  } catch (error) {
    apiHealthStatus = 'unhealthy';
    lastHealthCheck = now;
    console.error('[TMDB] Connection verification failed:', error);
    return {
      isHealthy: false,
      hasCustomKey: hasCustomApiKey,
      lastChecked: now,
      message: 'Unable to connect to TMDB API - check your internet connection',
    };
  }
}

// Helper to handle TMDB API errors gracefully
async function handleTMDBRequest<T>(
  url: string,
  errorContext: string
): Promise<T | null> {
  try {
    const response = await fetchWithTimeout(url, 10000); // 10 second timeout
    
    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        console.warn(`${errorContext}: Rate limited by TMDB API`);
        return null;
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error(`${errorContext}: Invalid TMDB API key`);
        apiHealthStatus = 'unhealthy';
        return null;
      }
      
      console.error(`${errorContext}: HTTP ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(`${errorContext}: Network error, using fallback data`);
    } else if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`${errorContext}: Request timeout`);
    } else {
      console.error(`${errorContext}:`, error);
    }
    return null;
  }
}

// Fetch trending movies from TMDB (last year only)
async function fetchTrendingMovies(): Promise<MediaItem[]> {
  const oneYearAgo = getOneYearAgo();
  const today = getToday();
  
  const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${oneYearAgo}&primary_release_date.lte=${today}&page=1`;
  
  const data = await handleTMDBRequest<{ results: any[] }>(
    url,
    'Failed to fetch trending movies'
  );
  
  if (!data || !data.results) return [];
  
  return data.results.map((item: any) => ({ ...item, media_type: 'movie' as const }));
}

// Fetch trending TV shows from TMDB (last year only)
async function fetchTrendingTVShows(): Promise<MediaItem[]> {
  const oneYearAgo = getOneYearAgo();
  const today = getToday();
  
  const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${oneYearAgo}&first_air_date.lte=${today}&page=1`;
  
  const data = await handleTMDBRequest<{ results: any[] }>(
    url,
    'Failed to fetch trending TV shows'
  );
  
  if (!data || !data.results) return [];
  
  return data.results.map((item: any) => ({ ...item, media_type: 'tv' as const }));
}

// Fetch featured content (curated from trending/discover endpoints)
async function fetchFeaturedContent(): Promise<MediaItem[]> {
  const oneYearAgo = getOneYearAgo();
  const today = getToday();
  
  // Fetch both movies and TV shows with high popularity
  const [moviesData, tvData] = await Promise.all([
    handleTMDBRequest<{ results: any[] }>(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${oneYearAgo}&primary_release_date.lte=${today}&vote_average.gte=7&page=1`,
      'Failed to fetch featured movies'
    ),
    handleTMDBRequest<{ results: any[] }>(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${oneYearAgo}&first_air_date.lte=${today}&vote_average.gte=7&page=1`,
      'Failed to fetch featured TV shows'
    ),
  ]);
  
  if (!moviesData?.results && !tvData?.results) return [];
  
  const movies = (moviesData?.results || []).map((item: any) => ({ ...item, media_type: 'movie' as const }));
  const tvShows = (tvData?.results || []).map((item: any) => ({ ...item, media_type: 'tv' as const }));
  
  // Combine and sort by popularity, then take top 12 for featured row
  const combined = [...movies, ...tvShows].sort((a, b) => b.popularity - a.popularity);
  return combined.slice(0, 12);
}

// Fetch trailer for a specific media item with detailed error categorization
async function fetchTrailer(mediaId: number, mediaType: 'movie' | 'tv'): Promise<TrailerResult> {
  const url = `${TMDB_BASE_URL}/${mediaType}/${mediaId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  
  try {
    const response = await fetchWithTimeout(url, 10000); // 10 second timeout
    
    if (!response.ok) {
      // Categorize HTTP errors
      if (response.status === 429) {
        devLog.trailerFetch('rate-limit', { mediaId, mediaType });
        return { status: 'error', errorType: 'rate-limit' };
      }
      if (response.status === 401) {
        devLog.trailerFetch('invalid-key', { mediaId, mediaType });
        return { status: 'error', errorType: 'invalid-key' };
      }
      devLog.trailerFetch('unknown', { mediaId, mediaType, statusCode: response.status });
      return { status: 'error', errorType: 'unknown' };
    }
    
    const data = await response.json();
    
    if (!data || !data.results) {
      devLog.trailerFetch('no-trailer', { mediaId, mediaType });
      return { status: 'no-trailer' };
    }
    
    const trailer = data.results.find(
      (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (!trailer) {
      devLog.trailerFetch('no-trailer', { mediaId, mediaType });
      return { status: 'no-trailer' };
    }
    
    devLog.trailerFetch('success', { mediaId, mediaType, hasKey: !!trailer.key });
    return { status: 'success', key: trailer.key };
  } catch (error) {
    // Categorize network errors
    if (error instanceof Error && error.name === 'AbortError') {
      devLog.trailerFetch('timeout', { mediaId, mediaType });
      return { status: 'error', errorType: 'timeout' };
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      devLog.trailerFetch('network', { mediaId, mediaType });
      return { status: 'error', errorType: 'network' };
    }
    devLog.trailerFetch('unknown', { mediaId, mediaType, error: error instanceof Error ? error.message : 'Unknown' });
    return { status: 'error', errorType: 'unknown' };
  }
}

// Fetch TV show details including last air date
async function fetchTVShowDetails(tvId: number): Promise<{ lastAirDate: string | null; posterPath: string | null; title: string }> {
  const url = `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`;
  
  const data = await handleTMDBRequest<any>(
    url,
    `Failed to fetch TV show details for ${tvId}`
  );
  
  if (!data) {
    throw new Error('Failed to fetch TV show details');
  }
  
  return {
    lastAirDate: data.last_air_date || null,
    posterPath: data.poster_path || null,
    title: data.name || 'Unknown Show',
  };
}

// Search TV shows by name
async function searchTVShows(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
  
  const data = await handleTMDBRequest<{ results: any[] }>(
    url,
    `Failed to search TV shows for "${query}"`
  );
  
  if (!data || !data.results) return [];
  
  return data.results.slice(0, 10); // Return top 10 results
}

// Hook to verify TMDB API health
export function useTMDBHealth() {
  return useQuery<ApiHealthStatus>({
    queryKey: ['tmdb-health'],
    queryFn: verifyTMDBConnection,
    staleTime: HEALTH_CHECK_INTERVAL,
    refetchInterval: HEALTH_CHECK_INTERVAL,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook to fetch all trending content with automatic 30-minute refresh
export function useTrendingContent() {
  return useQuery<MediaItem[]>({
    queryKey: ['trending-content'],
    queryFn: async () => {
      const [movies, tvShows] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingTVShows(),
      ]);
      return [...movies, ...tvShows].sort((a, b) => b.vote_average - a.vote_average);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // Automatically refetch every 30 minutes
    refetchOnMount: true,
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Hook to fetch featured content with automatic 30-minute refresh
export function useFeaturedContent() {
  return useQuery<MediaItem[]>({
    queryKey: ['featured-content'],
    queryFn: fetchFeaturedContent,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // Automatically refetch every 30 minutes
    refetchOnMount: true,
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Hook to fetch trailer - always fresh on modal open
export function useTrailer(
  mediaId: number | null,
  mediaType: 'movie' | 'tv' | null,
  isModalOpen: boolean
) {
  return useQuery<TrailerResult>({
    queryKey: ['trailer', mediaId, mediaType],
    queryFn: async () => {
      if (!mediaId || !mediaType) {
        throw new Error('Media ID and type are required');
      }
      
      return fetchTrailer(mediaId, mediaType);
    },
    enabled: !!mediaId && !!mediaType && isModalOpen,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache results
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: false, // Don't retry on error - let user manually retry
  });
}

// Hook to get caller's user profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Hook to save caller's user profile
export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Hook to get tracked shows from backend
export function useGetTrackedShows() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['tracked-shows'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTrackedShows();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
  });
}

// Hook to add tracked show to backend
export function useAddTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addTrackedShow(showId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-shows'] });
      queryClient.invalidateQueries({ queryKey: ['tracked-shows-details'] });
    },
    onError: (error: any) => {
      console.error('Error adding tracked show:', error);
      throw new Error(error?.message || 'Failed to add show to tracked list');
    },
  });
}

// Hook to remove tracked show from backend
export function useRemoveTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeTrackedShow(showId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-shows'] });
      queryClient.invalidateQueries({ queryKey: ['tracked-shows-details'] });
    },
    onError: (error: any) => {
      console.error('Error removing tracked show:', error);
      throw new Error(error?.message || 'Failed to remove show from tracked list');
    },
  });
}

// Hook to get last visit timestamp
export function useGetLastVisit() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint | null>({
    queryKey: ['last-visit'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLastVisit();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
  });
}

// Hook to update last visit timestamp
export function useUpdateLastVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateLastVisit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['last-visit'] });
    },
  });
}

// Hook to get tracked shows with details (including new episode indicators)
export function useGetTrackedShowsDetails() {
  const { data: trackedShowIds, isLoading: isLoadingIds } = useGetTrackedShows();
  const { data: lastVisit } = useGetLastVisit();

  return useQuery<TrackedShowDetails[]>({
    queryKey: ['tracked-shows-details', trackedShowIds, lastVisit?.toString()],
    queryFn: async () => {
      if (!trackedShowIds || trackedShowIds.length === 0) return [];

      const showDetailsPromises = trackedShowIds.map(async (showId) => {
        try {
          const details = await fetchTVShowDetails(Number(showId));
          
          // Check if there's a new episode since last visit
          const hasNewEpisode = lastVisit && details.lastAirDate
            ? new Date(details.lastAirDate).getTime() > Number(lastVisit) / 1_000_000
            : false;

          return {
            id: Number(showId),
            title: details.title,
            lastAirDate: details.lastAirDate,
            posterPath: details.posterPath,
            hasNewEpisode,
          };
        } catch (error) {
          console.error(`Failed to fetch details for show ${showId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(showDetailsPromises);
      return results.filter((show): show is TrackedShowDetails => show !== null);
    },
    enabled: !!trackedShowIds && trackedShowIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Hook to search TV shows
export function useSearchTVShows(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search-tv-shows', query],
    queryFn: () => searchTVShows(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Helper function to get TMDB image URL
export function getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/assets/generated/film-reel-transparent.dim_64x64.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
