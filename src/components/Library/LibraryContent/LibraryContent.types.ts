import type { BookWithChapters, Chapter } from '@/store/library-store'

export interface LibraryContentState {
  isLoading: boolean
  isTransitioning: boolean
  activeBook: BookWithChapters | null
  activeChapter: Chapter | null
  bookTitle: string
}
