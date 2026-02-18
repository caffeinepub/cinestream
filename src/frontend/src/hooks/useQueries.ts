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
// Returns a larger candidate list to support UI-side filtering/backfilling
async function fetchFeaturedContent(): Promise<MediaItem[]> {
  const oneYearAgo = getOneYearAgo();
  const today = getToday();
  
  // Fetch multiple pages to provide enough candidates for deduplication
  const movieUrl1 = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&primary_release_date.gte=${oneYearAgo}&primary_release_date.lte=${today}&page=1`;
  const movieUrl2 = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&primary_release_date.gte=${oneYearAgo}&primary_release_date.lte=${today}&page=2`;
  const tvUrl1 = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=500&first_air_date.gte=${oneYearAgo}&first_air_date.lte=${today}&page=1`;
  const tvUrl2 = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=500&first_air_date.gte=${oneYearAgo}&first_air_date.lte=${today}&page=2`;
  
  const [movieData1, movieData2, tvData1, tvData2] = await Promise.all([
    handleTMDBRequest<{ results: any[] }>(movieUrl1, 'Failed to fetch featured movies page 1'),
    handleTMDBRequest<{ results: any[] }>(movieUrl2, 'Failed to fetch featured movies page 2'),
    handleTMDBRequest<{ results: any[] }>(tvUrl1, 'Failed to fetch featured TV shows page 1'),
    handleTMDBRequest<{ results: any[] }>(tvUrl2, 'Failed to fetch featured TV shows page 2'),
  ]);
  
  const movies1 = movieData1?.results?.map((item: any) => ({ ...item, media_type: 'movie' as const })) || [];
  const movies2 = movieData2?.results?.map((item: any) => ({ ...item, media_type: 'movie' as const })) || [];
  const tvShows1 = tvData1?.results?.map((item: any) => ({ ...item, media_type: 'tv' as const })) || [];
  const tvShows2 = tvData2?.results?.map((item: any) => ({ ...item, media_type: 'tv' as const })) || [];
  
  // Combine and sort by vote average to provide high-quality candidates
  const combined = [...movies1, ...movies2, ...tvShows1, ...tvShows2];
  return combined.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
}

// Fetch trailer for a specific media item
async function fetchTrailer(mediaId: number, mediaType: 'movie' | 'tv'): Promise<TrailerResult> {
  const url = `${TMDB_BASE_URL}/${mediaType}/${mediaId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  
  try {
    const response = await fetchWithTimeout(url, 8000); // 8 second timeout
    
    if (!response.ok) {
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
    const trailer = data.results?.find(
      (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailer?.key) {
      devLog.trailerFetch('success', { mediaId, mediaType, hasKey: true });
      return { status: 'success', key: trailer.key };
    }
    
    devLog.trailerFetch('no-trailer', { mediaId, mediaType });
    return { status: 'no-trailer' };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      devLog.trailerFetch('timeout', { mediaId, mediaType });
      return { status: 'error', errorType: 'timeout' };
    }
    devLog.trailerFetch('network', { mediaId, mediaType });
    return { status: 'error', errorType: 'network' };
  }
}

// React Query Hooks

export function useTMDBHealth() {
  return useQuery<ApiHealthStatus>({
    queryKey: ['tmdb-health'],
    queryFn: verifyTMDBConnection,
    staleTime: HEALTH_CHECK_INTERVAL,
    refetchInterval: HEALTH_CHECK_INTERVAL,
  });
}

export function useTrendingContent() {
  return useQuery<MediaItem[]>({
    queryKey: ['trending-content'],
    queryFn: async () => {
      const [movies, tvShows] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingTVShows(),
      ]);
      
      // Combine and sort by popularity
      const combined = [...movies, ...tvShows];
      return combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes
  });
}

export function useFeaturedContent() {
  return useQuery<MediaItem[]>({
    queryKey: ['featured-content'],
    queryFn: fetchFeaturedContent,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useTrailer(mediaId: number | undefined, mediaType: 'movie' | 'tv' | undefined) {
  return useQuery<TrailerResult>({
    queryKey: ['trailer', String(mediaId), mediaType],
    queryFn: async () => {
      if (!mediaId || !mediaType) {
        return { status: 'no-trailer' };
      }
      return fetchTrailer(mediaId, mediaType);
    },
    enabled: !!mediaId && !!mediaType,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

// User Profile Hooks

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Tracked Shows Hooks

export function useGetTrackedShows() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['trackedShows'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrackedShows();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrackedShow(showId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedShows'] });
      queryClient.invalidateQueries({ queryKey: ['trackedShowsDetails'] });
    },
  });
}

export function useRemoveTrackedShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (showId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeTrackedShow(showId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedShows'] });
      queryClient.invalidateQueries({ queryKey: ['trackedShowsDetails'] });
    },
  });
}

export function useUpdateLastVisit() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLastVisit();
    },
  });
}

export function useGetLastVisit() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint | null>({
    queryKey: ['lastVisit'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLastVisit();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

async function fetchShowDetails(showId: string, lastVisit: bigint | null): Promise<TrackedShowDetails | null> {
  const url = `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US`;
  
  const data = await handleTMDBRequest<any>(
    url,
    `Failed to fetch show details for ${showId}`
  );
  
  if (!data) return null;
  
  const lastAirDate = data.last_air_date || null;
  const hasNewEpisode = lastVisit && lastAirDate 
    ? new Date(lastAirDate).getTime() > Number(lastVisit) / 1_000_000
    : false;
  
  return {
    id: data.id,
    title: data.name || 'Unknown',
    lastAirDate,
    posterPath: data.poster_path,
    hasNewEpisode,
  };
}

export function useGetTrackedShowsDetails() {
  const { data: trackedShowIds } = useGetTrackedShows();
  const { data: lastVisit } = useGetLastVisit();

  return useQuery<TrackedShowDetails[]>({
    queryKey: ['trackedShowsDetails', trackedShowIds, String(lastVisit)],
    queryFn: async () => {
      if (!trackedShowIds || trackedShowIds.length === 0) return [];
      
      const details = await Promise.all(
        trackedShowIds.map(id => fetchShowDetails(id, lastVisit || null))
      );
      
      return details.filter((show): show is TrackedShowDetails => show !== null);
    },
    enabled: !!trackedShowIds && trackedShowIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchShows(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['searchShows', query],
    queryFn: async () => {
      if (!query || query.trim().length === 0) return [];
      
      const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
      
      const data = await handleTMDBRequest<{ results: any[] }>(
        url,
        'Failed to search shows'
      );
      
      if (!data || !data.results) return [];
      
      return data.results.map((item: any) => ({
        id: item.id,
        name: item.name || 'Unknown',
        overview: item.overview || '',
        poster_path: item.poster_path,
        first_air_date: item.first_air_date || null,
      }));
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-poster.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
