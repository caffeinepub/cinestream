/**
 * Development-only diagnostic logging helper
 * Logs are only emitted in development mode (import.meta.env.DEV)
 * Never logs sensitive data like API keys or identity information
 */

const isDev = import.meta.env.DEV;

export const devLog = {
  trailerModal: (action: string, data: { mediaId?: number; mediaType?: string }) => {
    if (!isDev) return;
    console.log(`[TrailerModal] ${action}`, {
      mediaId: data.mediaId,
      mediaType: data.mediaType,
    });
  },

  mediaSelection: (action: string, data: { mediaId?: number; mediaType?: string; isOpen?: boolean }) => {
    if (!isDev) return;
    console.log(`[MediaSelection] ${action}`, {
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      isOpen: data.isOpen,
    });
  },

  trailerFetch: (
    outcome: 'success' | 'no-trailer' | 'rate-limit' | 'timeout' | 'network' | 'invalid-key' | 'unknown',
    data: { mediaId: number; mediaType: string; statusCode?: number; hasKey?: boolean; error?: string }
  ) => {
    if (!isDev) return;
    console.log(`[TrailerFetch] ${outcome}`, {
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      statusCode: data.statusCode,
      hasKey: data.hasKey,
      error: data.error,
    });
  },

  trailerResult: (
    status: 'success' | 'no-trailer' | 'error',
    data: { mediaId: number; mediaType: string; errorType?: string }
  ) => {
    if (!isDev) return;
    console.log(`[TrailerResult] ${status}`, {
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      errorType: data.errorType,
    });
  },

  iframeLifecycle: (event: 'mounted' | 'unmounted', data: { mediaId?: number; mediaType?: string; reason?: string }) => {
    if (!isDev) return;
    console.log(`[IframeLifecycle] ${event}`, {
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      reason: data.reason,
    });
  },
};
