import { create } from 'zustand'

import { bookCache, invalidateBookCache } from '@/store/library-cache'
import { DEFAULT_LANGUAGE, type Language } from '@/lib/languages'
import { loadChapterTranslationsAction } from '@/store/library-store/actions/loadChapterTranslations'
import { loadChapterTranslationContentAction } from '@/store/library-store/actions/loadChapterTranslationContent'
import { upsertChapterTranslationAction } from '@/store/library-store/actions/upsertChapterTranslation'
import { removeChapterTranslationAction } from '@/store/library-store/actions/removeChapterTranslation'
import { markBookGeneratingAction } from '@/store/library-store/actions/markBookGenerating'
import { clearBookGeneratingAction } from '@/store/library-store/actions/clearBookGenerating'

// ─── Types ───────────────────────────────────────────────────────

export interface BookMeta {
  id: string
  title: string
  description: string
  status: 'generating' | 'completed' | 'error'
  chapterCount: number
  model: string
  language: Language
  /** Total elapsed milliseconds from generation start to completion. `null`/undefined for books that were never timed (pre-existing). */
  generationDurationMs?: number | null
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  content: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  sortOrder: number
  isRead: boolean
  language: Language
  /** Elapsed milliseconds spent generating this chapter. `null`/undefined for chapters that were never timed (pre-existing). */
  generationDurationMs?: number | null
  createdAt: string
  updatedAt: string
}

export interface ChapterTranslation {
  id: string
  chapterId: string
  language: Language
  content: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  createdAt: string
  updatedAt: string
}

export interface BookWithChapters {
  book: BookMeta
  chapters: Chapter[]
}

// ─── State ───────────────────────────────────────────────────────

interface LibraryState {
  books: BookMeta[]
  isLoaded: boolean
  activeBookId: string | null
  activeBook: BookWithChapters | null
  activeChapterId: string | null
  isLoadingBook: boolean
  isLoadingChapter: boolean
  distractionFree: boolean
  // Translations indexed by chapterId → language → translation row
  chapterTranslations: Record<string, Record<string, ChapterTranslation>>
  // Active language to render per chapter (defaults to chapter.language when absent)
  activeChapterLanguage: Record<string, Language>
  /**
   * Ids of books with a LIVE in-flight generation (book/chapter/translation).
   * Added when a generation starts and removed on completion, error, or stop —
   * so it reliably returns to empty (unlike append-only `sessionBookIds` or the
   * persistable `status` field, which can get stuck on `'generating'`). Used by
   * `useReportLibraryBusy` to protect Library from eviction while ANY book is
   * generating, including background books the user isn't currently viewing.
   */
  generatingBookIds: Set<string>
}

interface LibraryActions {
  loadBooks: () => Promise<void>
  createBook: (title: string, description?: string, model?: string, language?: Language) => Promise<BookMeta>
  updateBook: (book: BookMeta) => Promise<void>
  removeBook: (bookId: string) => Promise<void>
  selectBook: (bookId: string | null) => Promise<void>
  reloadBook: (bookId: string) => Promise<void>
  selectChapter: (chapterId: string | null) => Promise<void>
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Chapter>
  updateChapter: (chapter: Chapter) => Promise<void>
  removeChapter: (chapterId: string, bookId: string) => Promise<void>
  updateChapterContent: (chapterId: string, content: string, bookId?: string) => Promise<void>
  updateChapterStatus: (chapterId: string, status: Chapter['status'], bookId?: string) => Promise<void>
  toggleChapterRead: (chapterId: string, isRead: boolean) => Promise<void>
  updateBookStatus: (bookId: string, status: BookMeta['status']) => Promise<void>
  /** Persist the elapsed generation time (ms) for a single chapter. */
  updateChapterTiming: (chapterId: string, durationMs: number, bookId?: string) => Promise<void>
  /** Persist the elapsed generation time (ms) for an entire book. */
  updateBookTiming: (bookId: string, durationMs: number) => Promise<void>
  setDistractionFree: (on: boolean) => void
  toggleDistractionFree: () => void
  // Translations
  loadChapterTranslations: (chapterId: string) => Promise<ChapterTranslation[]>
  loadChapterTranslationContent: (chapterId: string, language: Language) => Promise<string | null>
  upsertChapterTranslation: (translation: ChapterTranslation) => Promise<void>
  removeChapterTranslation: (chapterId: string, language: Language) => Promise<void>
  setActiveChapterLanguage: (chapterId: string, language: Language) => void
  /** Mark a book as actively generating (eviction protection). */
  markBookGenerating: (bookId: string) => void
  /** Clear a book's active-generation marker (on completion / error / stop). */
  clearBookGenerating: (bookId: string) => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  (set, get) => ({
    books: [],
    isLoaded: false,
    activeBookId: null,
    activeBook: null,
    activeChapterId: null,
    isLoadingBook: false,
    isLoadingChapter: false,
    distractionFree: false,
    chapterTranslations: {},
    activeChapterLanguage: {},
    generatingBookIds: new Set<string>(),

    loadBooks: async () => {
      const books = (await window.api.loadBooks()) as BookMeta[]
      set({ books, isLoaded: true })
    },

createBook: async (title, description = '', model = '', language = DEFAULT_LANGUAGE) => {
      const now = new Date().toISOString()
      const book: BookMeta & { chapterCount: number } = {
        id: crypto.randomUUID(),
        title,
        description,
        status: 'generating',
        chapterCount: 0,
        model,
        language,
        createdAt: now,
        updatedAt: now,
      }
      set((s) => ({ books: [book, ...s.books] }))
      await window.api.saveBook(book)
      return book
    },

    updateBook: async (book) => {
      const updated = { ...book, updatedAt: new Date().toISOString() }
      set((s) => ({
        books: s.books.map((b) => (b.id === updated.id ? updated : b)),
        activeBook:
          s.activeBook && s.activeBook.book.id === updated.id
            ? { ...s.activeBook, book: updated }
            : s.activeBook,
      }))
      // Sync cache
      const current = get()
      if (current.activeBookId && current.activeBook) {
        bookCache.set(current.activeBookId, current.activeBook)
      }
      await window.api.saveBook(updated)
    },

    removeBook: async (bookId) => {
      invalidateBookCache(bookId)
      set((s) => ({
        books: s.books.filter((b) => b.id !== bookId),
        activeBookId: s.activeBookId === bookId ? null : s.activeBookId,
        activeBook:
          s.activeBook?.book.id === bookId ? null : s.activeBook,
        activeChapterId:
          s.activeBook?.book.id === bookId ? null : s.activeChapterId,
      }))
      await window.api.removeBook(bookId)
    },

    selectBook: async (bookId) => {
      if (!bookId) {
        set({ activeBookId: null, activeBook: null, activeChapterId: null })
        return
      }
      if (bookId === get().activeBookId) {
        set({ activeChapterId: null })
        return
      }

      // Save current book to cache before switching
      const prev = get()
      if (prev.activeBookId && prev.activeBook) {
        bookCache.set(prev.activeBookId, prev.activeBook)
      }

      // Check cache for instant restore
      const cached = bookCache.peek(bookId)
      if (cached) {
        set({
          activeBookId: bookId,
          activeBook: cached,
          isLoadingBook: false,
          activeChapterId: null,
        })
        // Promote in LRU order
        bookCache.get(bookId).catch(() => {})
        return
      }

      // Cache miss — load from DB via cache loader
      set({ activeBookId: bookId, isLoadingBook: true, activeChapterId: null })
      try {
        const result = await bookCache.get(bookId)
        set({
          activeBook: result,
          isLoadingBook: false,
          activeChapterId: null,
        })
      } catch {
        set({ activeBook: null, isLoadingBook: false })
      }
    },

    reloadBook: async (bookId) => {
      const s = get()
      if (s.activeBookId !== bookId) return
      // Invalidate stale cache entry and reload fresh
      invalidateBookCache(bookId)
      const result = (await window.api.loadBookWithChapters(bookId)) as BookWithChapters | null
      if (result) {
        bookCache.set(bookId, result)
        set((prev) => ({
          activeBook: result,
          books: prev.books.map((b) => (b.id === bookId ? result.book : b)),
        }))
      }
    },

    selectChapter: async (chapterId) => {
      set({ activeChapterId: chapterId })
      if (!chapterId) return
      const s = get()
      if (!s.activeBook) return
      const chapter = s.activeBook.chapters.find((c) => c.id === chapterId)
      // Lazy-load content from DB if not already loaded
      if (chapter && !chapter.content) {
        set({ isLoadingChapter: true })
        const content = (await window.api.loadChapterContent(chapterId)) as string | null
        if (content) {
          set((prev) => {
            if (!prev.activeBook) return prev
            return {
              isLoadingChapter: false,
              activeBook: {
                ...prev.activeBook,
                chapters: prev.activeBook.chapters.map((c) =>
                  c.id === chapterId ? { ...c, content } : c
                ),
              },
            }
          })
          // Sync cache with loaded chapter content
          const updated = get()
          if (updated.activeBookId && updated.activeBook) {
            bookCache.set(updated.activeBookId, updated.activeBook)
          }
        } else {
          set({ isLoadingChapter: false })
        }
      }
    },

    addChapter: async (partial) => {
      const now = new Date().toISOString()
      const chapter: Chapter = {
        id: crypto.randomUUID(),
        bookId: partial.bookId,
        chapterNumber: partial.chapterNumber,
        title: partial.title,
        content: partial.content,
        status: partial.status,
        sortOrder: partial.sortOrder,
        isRead: false,
        language: partial.language ?? DEFAULT_LANGUAGE,
        createdAt: now,
        updatedAt: now,
      }

      // Always persist to DB first
      await window.api.saveChapter(chapter)

      // Update in-memory state only if this book is currently active
      set((s) => {
        if (!s.activeBook || s.activeBook.book.id !== chapter.bookId) return s
        const chapters = [...s.activeBook.chapters, chapter].sort(
          (a, b) => a.sortOrder - b.sortOrder
        )
        const updatedBook = {
          ...s.activeBook.book,
          chapterCount: chapters.length,
          updatedAt: now,
        }
        return {
          activeBook: { book: updatedBook, chapters },
          books: s.books.map((b) => (b.id === chapter.bookId ? updatedBook : b)),
        }
      })

      // Sync cache
      const current = get()
      if (current.activeBookId && current.activeBook) {
        bookCache.set(current.activeBookId, current.activeBook)
      }

      return chapter
    },

    updateChapter: async (chapter) => {
      const updated = { ...chapter, updatedAt: new Date().toISOString() }
      set((s) => {
        if (!s.activeBook || s.activeBook.book.id !== updated.bookId) return s
        return {
          activeBook: {
            ...s.activeBook,
            chapters: s.activeBook.chapters.map((c) =>
              c.id === updated.id ? updated : c
            ),
          },
        }
      })
      // Sync cache
      const current = get()
      if (current.activeBookId && current.activeBook) {
        bookCache.set(current.activeBookId, current.activeBook)
      }
      await window.api.saveChapter(updated)
    },

    removeChapter: async (chapterId, bookId) => {
      set((s) => {
        if (!s.activeBook || s.activeBook.book.id !== bookId) return s
        const chapters = s.activeBook.chapters.filter((c) => c.id !== chapterId)
        const updatedBook = {
          ...s.activeBook.book,
          chapterCount: chapters.length,
          updatedAt: new Date().toISOString(),
        }
        return {
          activeBook: { book: updatedBook, chapters },
          books: s.books.map((b) => (b.id === bookId ? updatedBook : b)),
          activeChapterId:
            s.activeChapterId === chapterId ? (chapters[0]?.id ?? null) : s.activeChapterId,
        }
      })
      // Sync cache
      const current = get()
      if (current.activeBookId && current.activeBook) {
        bookCache.set(current.activeBookId, current.activeBook)
      }
      await window.api.removeChapter(chapterId, bookId)
    },

    updateChapterContent: async (chapterId, content, bookId) => {
      const s = get()
      const isActiveBook = s.activeBook && (!bookId || s.activeBook.book.id === bookId)
      const chapter = isActiveBook
        ? s.activeBook!.chapters.find((c) => c.id === chapterId)
        : null

      if (chapter) {
        // Update in-memory for active book
        const updated = { ...chapter, content, updatedAt: new Date().toISOString() }
        set({
          activeBook: {
            ...s.activeBook!,
            chapters: s.activeBook!.chapters.map((c) =>
              c.id === chapterId ? updated : c
            ),
          },
        })
        // Sync cache
        const current = get()
        if (current.activeBookId && current.activeBook) {
          bookCache.set(current.activeBookId, current.activeBook)
        }
        await window.api.saveChapter(updated)
      } else {
        // Not the active book — load the real chapter row from DB, merge the
        // new content onto it, and save it back. Previously this branch saved
        // a stub object with `chapterNumber: 0`, `title: ''`, `sortOrder: 0`,
        // etc., which clobbered the real metadata of any background book.
        if (!bookId) {
          console.warn('[library-store] updateChapterContent called without bookId for non-active chapter; skipping')
          return
        }
        const freshData = (await window.api.loadBookWithChapters(bookId)) as BookWithChapters | null
        const ch = freshData?.chapters.find((c) => c.id === chapterId)
        if (!ch) {
          console.warn('[library-store] updateChapterContent: chapter not found in DB', { chapterId, bookId })
          return
        }
        const merged = { ...ch, content, updatedAt: new Date().toISOString() }
        await window.api.saveChapter(merged)
      }
    },

    updateChapterStatus: async (chapterId, status, bookId) => {
      const s = get()
      const isActiveBook = s.activeBook && (!bookId || s.activeBook.book.id === bookId)
      const chapter = isActiveBook
        ? s.activeBook!.chapters.find((c) => c.id === chapterId)
        : null

      if (chapter) {
        const updated = { ...chapter, status, updatedAt: new Date().toISOString() }
        set({
          activeBook: {
            ...s.activeBook!,
            chapters: s.activeBook!.chapters.map((c) =>
              c.id === chapterId ? updated : c
            ),
          },
        })
        // Sync cache
        const current = get()
        if (current.activeBookId && current.activeBook) {
          bookCache.set(current.activeBookId, current.activeBook)
        }
        await window.api.saveChapter(updated)
      } else {
        // Non-active book — save status directly via DB
        // We need the full chapter data; load it first
        const freshData = await window.api.loadBookWithChapters(bookId ?? '') as BookWithChapters | null
        const ch = freshData?.chapters.find((c) => c.id === chapterId)
        if (ch) {
          const updated = { ...ch, status, updatedAt: new Date().toISOString() }
          await window.api.saveChapter(updated)
        }
      }
    },

    toggleChapterRead: async (chapterId, isRead) => {
      const s = get()
      if (!s.activeBook) return
      const chapter = s.activeBook.chapters.find((c) => c.id === chapterId)
      if (!chapter) return
      const updated = { ...chapter, isRead, updatedAt: new Date().toISOString() }
      set({
        activeBook: {
          ...s.activeBook,
          chapters: s.activeBook.chapters.map((c) =>
            c.id === chapterId ? updated : c
          ),
        },
      })
      // Sync cache
      const current = get()
      if (current.activeBookId && current.activeBook) {
        bookCache.set(current.activeBookId, current.activeBook)
      }
      await window.api.saveChapter(updated)
    },

    updateBookStatus: async (bookId, status) => {
      const s = get()
      const book = s.books.find((b) => b.id === bookId)
      if (!book) return
      const updated = { ...book, status, updatedAt: new Date().toISOString() }
      set((prev) => ({
        books: prev.books.map((b) => (b.id === bookId ? updated : b)),
        activeBook:
          prev.activeBook?.book.id === bookId
            ? { ...prev.activeBook, book: updated }
            : prev.activeBook,
      }))
      await window.api.saveBook(updated)
    },

    updateChapterTiming: async (chapterId, durationMs, bookId) => {
      const s = get()
      const isActiveBook = s.activeBook && (!bookId || s.activeBook.book.id === bookId)
      const chapter = isActiveBook
        ? s.activeBook!.chapters.find((c) => c.id === chapterId)
        : null

      if (chapter) {
        const updated = {
          ...chapter,
          generationDurationMs: durationMs,
          updatedAt: new Date().toISOString(),
        }
        set({
          activeBook: {
            ...s.activeBook!,
            chapters: s.activeBook!.chapters.map((c) =>
              c.id === chapterId ? updated : c
            ),
          },
        })
        const current = get()
        if (current.activeBookId && current.activeBook) {
          bookCache.set(current.activeBookId, current.activeBook)
        }
        await window.api.saveChapter(updated)
      } else {
        // Not the active book — load full chapter row from DB, patch, save back
        const freshData = await window.api.loadBookWithChapters(bookId ?? '') as BookWithChapters | null
        const ch = freshData?.chapters.find((c) => c.id === chapterId)
        if (ch) {
          const updated = {
            ...ch,
            generationDurationMs: durationMs,
            updatedAt: new Date().toISOString(),
          }
          await window.api.saveChapter(updated)
        }
      }
    },

    updateBookTiming: async (bookId, durationMs) => {
      const s = get()
      const book = s.books.find((b) => b.id === bookId)
      if (!book) return
      const updated = {
        ...book,
        generationDurationMs: durationMs,
        updatedAt: new Date().toISOString(),
      }
      set((prev) => ({
        books: prev.books.map((b) => (b.id === bookId ? updated : b)),
        activeBook:
          prev.activeBook?.book.id === bookId
            ? { ...prev.activeBook, book: updated }
            : prev.activeBook,
      }))
      const current = get()
      if (current.activeBookId && current.activeBook && current.activeBook.book.id === bookId) {
        bookCache.set(current.activeBookId, current.activeBook)
      }
      await window.api.saveBook(updated)
    },

    setDistractionFree: (on) => {
      set({ distractionFree: on })
    },

    toggleDistractionFree: () => {
      set((prev) => ({ distractionFree: !prev.distractionFree }))
    },

    loadChapterTranslations: (chapterId) => loadChapterTranslationsAction(get, set, chapterId),
    loadChapterTranslationContent: (chapterId, language) =>
      loadChapterTranslationContentAction(get, set, chapterId, language),
    upsertChapterTranslation: (translation) =>
      upsertChapterTranslationAction(get, set, translation),
    removeChapterTranslation: (chapterId, language) =>
      removeChapterTranslationAction(get, set, chapterId, language),
    setActiveChapterLanguage: (chapterId, language) => {
      set((prev) => ({
        activeChapterLanguage: { ...prev.activeChapterLanguage, [chapterId]: language },
      }))
    },
    markBookGenerating: (bookId) => markBookGeneratingAction(get, set, bookId),
    clearBookGenerating: (bookId) => clearBookGeneratingAction(get, set, bookId),
  })
)
