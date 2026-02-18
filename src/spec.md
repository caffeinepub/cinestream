# Specification

## Summary
**Goal:** Fix broken trailer playback functionality so users can watch trailers again.

**Planned changes:**
- Restore the TrailerModal component to render a functional modal dialog with YouTube iframe player
- Implement trailer fetching logic that queries TMDB API for video/trailer data with proper error handling
- Update MediaCard to trigger the TrailerModal when "Watch Trailer" is clicked
- Add explicit UI states in TrailerModal for loading, no trailer available, and fetch errors with retry capability
- Configure Dialog z-index to ensure modal renders above all page content
- Manage modal state transitions to reliably re-fetch and render trailers when reopened

**User-visible outcome:** Users can click "Watch Trailer" on any media card to open a modal that plays the trailer via YouTube iframe, with clear feedback for loading, errors, and missing trailers.
