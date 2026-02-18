/**
 * Stable key generation and deduplication utilities for MediaItem entries.
 * Ensures consistent React keys and prevents duplicate items across sections.
 */

import type { MediaItem } from '../App';

/**
 * Generate a stable unique key for a MediaItem.
 * Format: `${media_type}-${id}` to distinguish movies and TV shows with the same numeric id.
 */
export function getMediaKey(item: MediaItem): string {
  return `${item.media_type}-${item.id}`;
}

/**
 * Select the first N unique MediaItem entries from a list, preserving order.
 * Deduplicates by stable key and backfills to reach the target count when possible.
 * 
 * @param items - Source list of media items
 * @param count - Target number of unique items to return
 * @returns Array of up to `count` unique items
 */
export function selectUniqueMedia(items: MediaItem[], count: number): MediaItem[] {
  const seen = new Set<string>();
  const unique: MediaItem[] = [];

  for (const item of items) {
    const key = getMediaKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
      if (unique.length >= count) break;
    }
  }

  return unique;
}

/**
 * Filter out items from a candidate list that exist in an exclusion set.
 * Used to remove items from Featured that are already in Trending.
 * 
 * @param candidates - List of items to filter
 * @param exclusionKeys - Set of keys to exclude
 * @param targetCount - Target number of items to return after filtering
 * @returns Array of up to `targetCount` filtered items
 */
export function filterExcludingKeys(
  candidates: MediaItem[],
  exclusionKeys: Set<string>,
  targetCount: number
): MediaItem[] {
  const filtered: MediaItem[] = [];

  for (const item of candidates) {
    const key = getMediaKey(item);
    if (!exclusionKeys.has(key)) {
      filtered.push(item);
      if (filtered.length >= targetCount) break;
    }
  }

  return filtered;
}
