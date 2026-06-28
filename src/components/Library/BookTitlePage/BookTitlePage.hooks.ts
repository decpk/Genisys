import { useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'

import type { BookTitlePageData } from './BookTitlePage.types'

export function useBookTitlePage(): BookTitlePageData | null {
  const activeBook = useLibraryStore((s) => s.activeBook)

  return useMemo(() => {
    if (!activeBook) return null

    const { book, chapters } = activeBook
    const readCount = chapters.filter((c) => c.isRead).length
    const createdDate = new Date(book.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return {
      title: book.title,
      description: book.description,
      chaptersCount: chapters.length,
      readCount,
      createdDate,
      status: book.status,
      generationDurationMs: book.generationDurationMs ?? null,
    }
  }, [activeBook])
}
