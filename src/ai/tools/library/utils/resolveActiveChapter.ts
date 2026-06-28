import { useLibraryStore, type Chapter } from '@/store/library-store'

export interface ResolvedChapter {
  chapter: Chapter
  bookId: string
}

export type ResolveChapterResult = ResolvedChapter | { error: string }

/** Resolve a chapter (and its bookId) from the currently active book. */
export function resolveActiveChapter(chapterId: string): ResolveChapterResult {
  if (!chapterId) return { error: 'chapterId is required.' }
  const { activeBook } = useLibraryStore.getState()
  if (!activeBook) return { error: 'No book is currently active.' }
  const chapter = activeBook.chapters.find((c) => c.id === chapterId)
  if (!chapter) return { error: `Chapter "${chapterId}" not found in active book.` }
  return { chapter, bookId: activeBook.book.id }
}
