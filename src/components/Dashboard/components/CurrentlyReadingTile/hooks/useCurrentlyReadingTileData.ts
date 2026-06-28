import {
  useRecentlyOpenedBooks,
  type UseRecentlyOpenedBooksResult,
} from './useRecentlyOpenedBooks'
import { useResumeReading, type UseResumeReadingResult } from './useResumeReading'

export interface UseCurrentlyReadingTileDataResult {
  recents: UseRecentlyOpenedBooksResult
  actions: UseResumeReadingResult
}

/**
 * Orchestrator for the Currently Reading tile.
 * Per-book progress is read inside each row via `useReadingProgress(bookId)`.
 */
export function useCurrentlyReadingTileData(): UseCurrentlyReadingTileDataResult {
  const recents = useRecentlyOpenedBooks()
  const actions = useResumeReading()
  return { recents, actions }
}
