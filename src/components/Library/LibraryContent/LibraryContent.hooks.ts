import { startTransition, useState, useEffect } from 'react'

import { useLibraryStore, type Chapter } from '@/store/library-store'

import type { LibraryContentState } from './LibraryContent.types'

export function useLibraryContent(): LibraryContentState {
  const activeBook = useLibraryStore((s) => s.activeBook)
  const activeChapterId = useLibraryStore((s) => s.activeChapterId)
  const isLoadingBook = useLibraryStore((s) => s.isLoadingBook)
  const isLoadingChapter = useLibraryStore((s) => s.isLoadingChapter)

  const isLoading = isLoadingBook || isLoadingChapter

  // Local chapter ID that updates via startTransition so React can show
  // a loading state while the heavy ChapterViewer render prepares
  const [renderedChapterId, setRenderedChapterId] = useState(activeChapterId)
  const isTransitioning = activeChapterId !== renderedChapterId

  useEffect(() => {
    startTransition(() => {
      setRenderedChapterId(activeChapterId)
    })
  }, [activeChapterId])

  let activeChapter: Chapter | null = null
  if (renderedChapterId && activeBook) {
    activeChapter = activeBook.chapters.find((c) => c.id === renderedChapterId) ?? null
  }

  const bookTitle = activeBook?.book.title ?? ''

  return { isLoading, isTransitioning, activeBook, activeChapter, bookTitle }
}
