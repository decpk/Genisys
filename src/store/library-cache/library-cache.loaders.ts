import type { BookWithChapters } from '@/store/library-store'
import type { CachedBook } from './library-cache.types'

/** Load a book with all its chapters from the database. */
export async function loadBookFromDB(bookId: string): Promise<CachedBook> {
  const result = (await window.api.loadBookWithChapters(bookId)) as BookWithChapters | null
  if (!result) {
    throw new Error(`Book not found: ${bookId}`)
  }
  return result
}
