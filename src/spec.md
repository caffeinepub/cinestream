# Specification

## Summary
**Goal:** Remove duplicate media items within the Netflix Top 10 section and across Featured vs Trending, while keeping homepage section styling consistent with the existing theme.

**Planned changes:**
- Deduplicate items in Netflix Top 10 by stable key `${media_type}-${id}` before selecting the Top 10, and backfill with the next unique items to show up to 10 unique entries when available.
- Filter Featured to exclude any items that already appear in Trending (ContentGrid) using `${media_type}-${id}`, and backfill Featured with additional unique candidates to maintain its intended item count when possible.
- Ensure Featured, Netflix Top 10, and Trending preserve existing typography, spacing, glassmorphic styling, and consistent header/card treatments after the deduplication logic changes.

**User-visible outcome:** The homepage Netflix Top 10 and Featured sections no longer show repeated titles (including repeats across sections), and all sections remain visually cohesive with the existing site theme.
