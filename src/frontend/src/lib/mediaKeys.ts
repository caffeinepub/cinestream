import type { MediaItem } from '../App';

/**
 * Generate a stable, unique key for a MediaItem
 */
export function getMediaKey(item: MediaItem): string {
  return `${item.media_type}-${item.id}`;
}

/**
 * Deduplicate an array of MediaItems, preserving order
 */
export function deduplicateMedia(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getMediaKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
