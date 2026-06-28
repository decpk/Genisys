import { AsyncLRUCache } from '@/lib/async-lru-cache'

import type { CachedBook } from './library-cache.types'
import { LIBRARY_CACHE_MAX_SIZE } from './library-cache.types'
import { loadBookFromDB } from './library-cache.loaders'

/** LRU cache for books with chapters (keyed by bookId). */
export const bookCache = new AsyncLRUCache<string, CachedBook>({
  maxSize: LIBRARY_CACHE_MAX_SIZE,
  loader: loadBookFromDB,
})

/** Invalidate a specific book from the cache. */
export function invalidateBookCache(bookId: string): void {
  bookCache.invalidate(bookId)
}

/** Clear all book caches entirely. */
export function clearAllBookCaches(): void {
  bookCache.clear()
}
