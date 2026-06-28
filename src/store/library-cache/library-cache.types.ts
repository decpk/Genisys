import type { BookWithChapters } from '@/store/library-store'

/** Cached payload for a book with its chapters (chapter content may be lazy). */
export type CachedBook = BookWithChapters

/** Maximum number of books kept in the LRU cache. */
export const LIBRARY_CACHE_MAX_SIZE = 15
