import { useEffect, useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'
import { useBookmarkStore } from '@/store/bookmark-store'

import type { ResumeTarget } from './ResumeReading.types'

interface UseResumeReadingReturn {
  resumeTarget: ResumeTarget | null
  selectChapter: (chapterId: string | null) => Promise<void>
}

export function useResumeReading(): UseResumeReadingReturn {
  const activeBook = useLibraryStore((s) => s.activeBook)
  const selectChapter = useLibraryStore((s) => s.selectChapter)

  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const isBookmarksLoaded = useBookmarkStore((s) => s.isLoaded)
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks)

  useEffect(() => {
    if (!isBookmarksLoaded) loadBookmarks()
  }, [isBookmarksLoaded, loadBookmarks])

  const bookId = activeBook?.book.id
  const chapters = useMemo(() => activeBook?.chapters ?? [], [activeBook])

  const resumeTarget = useMemo((): ResumeTarget | null => {
    if (!bookId) return null

    const bookBookmarks = bookmarks
      .filter((b) => b.bookId === bookId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (bookBookmarks.length > 0) {
      const bm = bookBookmarks[0]
      const ch = chapters.find((c) => c.id === bm.chapterId)
      if (ch) {
        return {
          type: 'bookmark',
          chapterId: bm.chapterId,
          label: bm.label,
          chapterTitle: ch.title,
          chapterNumber: ch.chapterNumber,
        }
      }
    }

    const firstUnread = chapters.find((c) => c.status === 'completed' && !c.isRead)
    if (firstUnread) {
      return {
        type: 'chapter',
        chapterId: firstUnread.id,
        label: firstUnread.title,
        chapterTitle: firstUnread.title,
        chapterNumber: firstUnread.chapterNumber,
      }
    }

    const readChapters = chapters
      .filter((c) => c.isRead)
      .sort((a, b) => b.chapterNumber - a.chapterNumber)

    if (readChapters.length > 0) {
      const next = chapters.find(
        (c) => c.chapterNumber === readChapters[0].chapterNumber + 1 && c.status === 'completed',
      )
      if (next) {
        return {
          type: 'chapter',
          chapterId: next.id,
          label: next.title,
          chapterTitle: next.title,
          chapterNumber: next.chapterNumber,
        }
      }
    }

    return null
  }, [bookmarks, bookId, chapters])

  return { resumeTarget, selectChapter }
}
