import { useEffect, useMemo } from 'react'

import { useLibraryStore, type BookMeta } from '@/store/library-store'

import { MAX_BOOKS_VISIBLE } from '../CurrentlyReadingTile.constants'

export interface UseRecentlyOpenedBooksResult {
  books: BookMeta[]
  isLoaded: boolean
}

/**
 * Returns up to `MAX_BOOKS_VISIBLE` books sorted by `updatedAt` desc
 * (the closest available proxy for "last opened" — book metadata doesn't
 * track access time separately).
 *
 * Triggers a one-shot `loadBooks()` if the store hasn't been hydrated yet.
 */
export function useRecentlyOpenedBooks(): UseRecentlyOpenedBooksResult {
  const books = useLibraryStore((s) => s.books)
  const isLoaded = useLibraryStore((s) => s.isLoaded)
  const loadBooks = useLibraryStore((s) => s.loadBooks)

  useEffect(() => {
    if (!isLoaded) void loadBooks()
  }, [isLoaded, loadBooks])

  const sorted = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_BOOKS_VISIBLE)
  }, [books])

  return { books: sorted, isLoaded }
}
