# Specification

## Summary
**Goal:** Fix the “Watch Trailer” flow so the TrailerModal reliably appears above all content and the YouTube trailer loads and plays consistently.

**Planned changes:**
- Investigate and fix the regression preventing trailers from rendering (modal visibility, overlay layering, and reliable YouTube iframe mount) when launched from both FeaturedRow and ContentGrid.
- Ensure closing the TrailerModal stops playback and that reopening the same trailer works without getting stuck in a blank state.
- Harden trailer fetching so transient TMDB failures show an explicit error state with a retry action, and subsequent opens re-attempt the fetch rather than persisting a false “no trailer” result.
- Add development-only console diagnostics for modal open/close, trailer fetch outcome category (success/no-trailer/error type), and iframe mount/unmount, without exposing sensitive data or spamming production logs.

**User-visible outcome:** Clicking “Watch Trailer” opens a visible modal overlay with a playable YouTube trailer (when available); errors show a retry option; closing stops audio/video; reopening works reliably.
