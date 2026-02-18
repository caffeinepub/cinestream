# Specification

## Summary
**Goal:** Make the Netflix content on the homepage clearly identifiable and easy to find.

**Planned changes:**
- Render the existing `NetflixTop10` component within the homepage’s main `<main>` flow alongside other primary sections (e.g., Featured/Trending), visible without login.
- Wire Netflix item clicks to the same `onMediaClick` handler behavior used by other homepage media sections.
- Update the Netflix section header so it explicitly includes “Netflix” (e.g., “Netflix Top 10”) and remains present/clear in both loading and loaded states.

**User-visible outcome:** Visitors can immediately see a clearly labeled Netflix section on the homepage and interact with its items the same way they do with other media sections (e.g., opening trailers/details).
