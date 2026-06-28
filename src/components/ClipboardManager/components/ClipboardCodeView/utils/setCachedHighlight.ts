import { highlightCache, HIGHLIGHT_CACHE_MAX_ENTRIES } from './highlightCache'

/**
 * Stores Shiki HTML in the cache with soft FIFO eviction once the entry count
 * exceeds `HIGHLIGHT_CACHE_MAX_ENTRIES`.
 */
export function setCachedHighlight(key: string, html: string): void {
  if (highlightCache.size >= HIGHLIGHT_CACHE_MAX_ENTRIES) {
    const firstKey = highlightCache.keys().next().value
    if (firstKey !== undefined) highlightCache.delete(firstKey)
  }
  highlightCache.set(key, html)
}
