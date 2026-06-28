import { useBookmarkStore } from '@/store/bookmark-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const bookmarksSource: PaletteSource = {
  id: 'bookmarks',
  kinds: ['bookmark'],
  load: async () => {
    try {
      const state = useBookmarkStore.getState() as { loadBookmarks?: () => Promise<void> }
      await state.loadBookmarks?.()
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useBookmarkStore.getState() as {
        bookmarks?: Array<{
          id: string
          bookId: string
          chapterId: string
          label?: string
          note?: string
          bookTitle?: string
          chapterTitle?: string
        }>
      }
      const bookmarks = state.bookmarks ?? []
      return bookmarks.map((b): PaletteItem => {
        const title = b.label || b.note || 'Bookmark'
        const breadcrumb = [b.bookTitle, b.chapterTitle].filter(Boolean).join(' › ') || 'Library bookmark'
        return {
          id: `bookmark:${b.id}`,
          kind: 'bookmark',
          title,
          subtitle: breadcrumb,
          keywords: ['bookmark', 'library', 'book', 'chapter', b.bookTitle ?? '', b.chapterTitle ?? ''].filter(Boolean) as string[],
          group: 'navigate',
          action: () =>
            safeRun(() => useNavigationStore.getState().openLibraryBook(b.bookId)),
        }
      })
    } catch {
      return []
    }
  },
}
