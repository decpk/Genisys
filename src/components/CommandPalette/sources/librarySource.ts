import { useLibraryStore } from '@/store/library-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import { truncate } from '../utils/truncate'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const librarySource: PaletteSource = {
  id: 'library',
  kinds: ['book'],
  load: async () => {
    try {
      await useLibraryStore.getState().loadBooks()
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useLibraryStore.getState() as {
        books?: Array<{ id: string; title: string; description?: string }>
      }
      const books = state.books ?? []
      return books.map(
        (book): PaletteItem => ({
          id: `book:${book.id}`,
          kind: "book",
          title: book.title || "Untitled book",
          subtitle: truncate(book.description, 80) || "Library",
          keywords: ["book", "library", "read", "reading", "chapter"],
          group: "navigate",
          action: () =>
            safeRun(() =>
              useNavigationStore.getState().openLibraryBook(book.id),
            ),
        }),
      );
    } catch {
      return []
    }
  },
}
