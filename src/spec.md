# Specification

## Summary
**Goal:** Remove the Featured row’s left/right overlay navigation buttons while keeping native horizontal scrolling.

**Planned changes:**
- Update `frontend/src/components/FeaturedRow.tsx` to stop rendering the left/right navigation `<Button>` elements (ChevronLeft/ChevronRight).
- Keep native horizontal scrolling enabled (preserve `overflow-x-auto`) and remove any now-unused imports/callback logic.
- Adjust container padding/spacing so there is no reserved empty space where the buttons used to be and cards align naturally.

**User-visible outcome:** The Featured row no longer shows left/right scroll buttons, but users can still scroll the row horizontally via touch swipe, trackpad, or mouse wheel.
