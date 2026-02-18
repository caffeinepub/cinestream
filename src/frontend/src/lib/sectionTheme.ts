/**
 * Shared section theme constants for consistent styling across homepage sections.
 * Prevents styling drift during refactors by centralizing glassmorphic design tokens.
 */

/**
 * Header styling for major sections (Featured, Netflix Top 10, Trending)
 */
export const SECTION_HEADER_CLASS = 'text-4xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong';

/**
 * Large header styling for Featured section
 */
export const FEATURED_HEADER_CLASS = 'text-5xl font-bold text-white netflix-accent-bar tracking-tight text-glass-strong';

/**
 * Container padding for sections
 */
export const SECTION_CONTAINER_CLASS = 'container px-6';

/**
 * Section vertical spacing
 */
export const SECTION_SPACING_CLASS = 'py-12';

/**
 * Section vertical spacing for Featured (larger)
 */
export const FEATURED_SPACING_CLASS = 'py-16';

/**
 * Grid layout for Netflix Top 10
 */
export const NETFLIX_GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6';

/**
 * Grid layout for Trending content
 */
export const TRENDING_GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';

/**
 * Glassmorphic panel for loading states
 */
export const GLASS_PANEL_CLASS = 'glass-panel animate-shimmer';

/**
 * Horizontal divider with gradient
 */
export const DIVIDER_CLASS = 'h-px bg-gradient-to-r from-transparent via-white/20 to-transparent';
