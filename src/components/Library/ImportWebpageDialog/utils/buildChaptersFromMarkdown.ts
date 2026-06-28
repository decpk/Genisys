import type { Chapter } from '@/store/library-store'
import type { Language } from '@/lib/languages'

import { parseMarkdownToChapters } from '../../md-book-parser'

export type ChapterDraft = Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Parse a markdown document into the chapter-partial shape consumed by
 * `library-store.addChapter`. Pure — performs no store calls.
 */
export function buildChaptersFromMarkdown(
  markdown: string,
  bookId: string,
  language: Language,
): ChapterDraft[] {
  const rawChapters = parseMarkdownToChapters(markdown)
  return rawChapters.map((chapter) => ({
    bookId,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    content: chapter.content,
    status: 'completed',
    sortOrder: chapter.chapterNumber,
    isRead: false,
    language,
  }))
}
