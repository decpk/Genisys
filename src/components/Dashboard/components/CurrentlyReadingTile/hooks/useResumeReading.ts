import { useCallback } from 'react'

import { useNavigationStore } from '@/store/navigation-store'

export interface UseResumeReadingResult {
  resume: (bookId: string) => void
}

/**
 * Returns a stable handler that opens the Library at the given book.
 */
export function useResumeReading(): UseResumeReadingResult {
  const openLibraryBook = useNavigationStore((s) => s.openLibraryBook)

  const resume = useCallback(
    (bookId: string) => openLibraryBook(bookId),
    [openLibraryBook]
  )

  return { resume }
}
