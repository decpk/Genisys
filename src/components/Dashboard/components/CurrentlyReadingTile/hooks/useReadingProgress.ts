import { useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'

import { computeReadingProgress } from '../utils/computeReadingProgress'

export interface BookProgress {
  /** 0–100 if the book is currently active and chapters are loaded; null otherwise. */
  percent: number | null
}

/**
 * Reading progress is only known for the *active* book (chapters are lazy-loaded).
 * For every other book in the recents list, we return `null` — the UI shows a
 * neutral state instead of guessing.
 */
export function useReadingProgress(bookId: string): BookProgress {
  const activeBook = useLibraryStore((s) => s.activeBook)

  return useMemo(() => {
    if (!activeBook || activeBook.book.id !== bookId) {
      return { percent: null }
    }
    return { percent: computeReadingProgress(activeBook.chapters) }
  }, [activeBook, bookId])
}
