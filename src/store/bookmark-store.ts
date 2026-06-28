import { create } from 'zustand'
import { useSettingsStore } from './settings-store'

// ─── Types ───────────────────────────────────────────────────────

export interface BookmarkWithContext {
  id: string
  bookId: string
  chapterId: string
  highlightId: string
  label: string
  note: string
  createdAt: string
  bookTitle: string
  chapterTitle: string
  chapterNumber: number
}

export type BookmarkViewMode = 'grouped' | 'flat' | 'recent'

// ─── State ───────────────────────────────────────────────────────

interface BookmarkState {
  bookmarks: BookmarkWithContext[]
  isLoaded: boolean
  isLoading: boolean
  viewMode: BookmarkViewMode
  filter: string
  /** Bookmarks for the currently active chapter (lightweight cache) */
  chapterBookmarkIds: Set<string>
  chapterBookmarksLoaded: string | null
}

interface BookmarkActions {
  loadBookmarks: () => Promise<void>
  loadChapterBookmarks: (chapterId: string) => Promise<void>
  getChapterBookmarks: (chapterId: string) => Promise<BookmarkWithContext[]>
  addBookmark: (params: {
    bookId: string
    chapterId: string
    highlightId: string
    label: string
    note?: string
  }) => Promise<void>
  removeBookmark: (bookmarkId: string) => Promise<void>
  toggleBookmark: (params: {
    bookId: string
    chapterId: string
    highlightId: string
    label: string
  }) => Promise<void>
  isBookmarked: (highlightId: string) => boolean
  setViewMode: (mode: BookmarkViewMode) => void
  setFilter: (filter: string) => void
}

// ─── Store ───────────────────────────────────────────────────────

let _chapterBookmarksPromise: Promise<BookmarkWithContext[]> | null = null
let _chapterBookmarksPromiseId: string | null = null

export const useBookmarkStore = create<BookmarkState & BookmarkActions>()(
  (set, get) => ({
    bookmarks: [],
    isLoaded: false,
    isLoading: false,
    viewMode: useSettingsStore.getState().libraryDefaultBookmarkView,
    filter: '',
    chapterBookmarkIds: new Set(),
    chapterBookmarksLoaded: null,

    loadBookmarks: async () => {
      if (get().isLoading) return
      set({ isLoading: true })
      const bookmarks = (await window.api.loadBookmarks()) as BookmarkWithContext[]
      set({ bookmarks, isLoaded: true, isLoading: false })
    },

    loadChapterBookmarks: async (chapterId: string) => {
      await get().getChapterBookmarks(chapterId)
    },

    getChapterBookmarks: async (chapterId: string) => {
      if (_chapterBookmarksPromiseId === chapterId && _chapterBookmarksPromise) {
        return _chapterBookmarksPromise
      }
      _chapterBookmarksPromiseId = chapterId
      _chapterBookmarksPromise = window.api.loadBookmarksForChapter(chapterId).then((raw) => {
        const items = raw as BookmarkWithContext[]
        set({
          chapterBookmarkIds: new Set(items.map((b) => b.highlightId)),
          chapterBookmarksLoaded: chapterId,
        })
        return items
      })
      return _chapterBookmarksPromise
    },

    addBookmark: async ({ bookId, chapterId, highlightId, label, note = '' }) => {
      const now = new Date().toISOString()
      const bookmark = {
        id: crypto.randomUUID(),
        bookId,
        chapterId,
        highlightId,
        label,
        note,
        createdAt: now,
      }
      await window.api.saveBookmark(bookmark)

      // Update chapter bookmark cache
      set((s) => {
        const newIds = new Set(s.chapterBookmarkIds)
        newIds.add(highlightId)
        return { chapterBookmarkIds: newIds }
      })

      // If full list was loaded, refresh it
      if (get().isLoaded) {
        const bookmarks = (await window.api.loadBookmarks()) as BookmarkWithContext[]
        set({ bookmarks })
      }
    },

    removeBookmark: async (bookmarkId: string) => {
      const { bookmarks } = get()
      const bookmark = bookmarks.find((b) => b.id === bookmarkId)

      await window.api.removeBookmark(bookmarkId)

      // Update chapter bookmark cache
      if (bookmark) {
        set((s) => {
          const newIds = new Set(s.chapterBookmarkIds)
          newIds.delete(bookmark.highlightId)
          return { chapterBookmarkIds: newIds }
        })
      }

      // Update full list
      set((s) => ({
        bookmarks: s.bookmarks.filter((b) => b.id !== bookmarkId),
      }))
    },

    toggleBookmark: async ({ bookId, chapterId, highlightId, label }) => {
      const { chapterBookmarkIds, bookmarks } = get()
      if (chapterBookmarkIds.has(highlightId)) {
        // Find and remove
        const existing = bookmarks.find(
          (b) => b.chapterId === chapterId && b.highlightId === highlightId
        )
        if (existing) {
          await get().removeBookmark(existing.id)
        } else {
          // Fallback: if full list not loaded, load from chapter
          const items = (await window.api.loadBookmarksForChapter(chapterId)) as BookmarkWithContext[]
          const found = items.find((b) => b.highlightId === highlightId)
          if (found) await get().removeBookmark(found.id)
        }
      } else {
        await get().addBookmark({ bookId, chapterId, highlightId, label })
      }
    },

    isBookmarked: (highlightId: string) => {
      return get().chapterBookmarkIds.has(highlightId)
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setFilter: (filter) => set({ filter }),
  })
)
