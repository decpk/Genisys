import type { Language } from '@/lib/languages'
import { useLibraryStore } from '@/store/library-store'

import { parseBookResponse } from '../book-parser'

/**
 * Persist a translated chapter (or article single-chapter) into the
 * `chapter_translations` store + DB. Called from the generator's
 * stream-done handler when `session.translationLanguage` is set.
 */
export async function persistChapterTranslation(
  bookId: string,
  rawContent: string,
  pendingChapterNumber: number,
  targetLanguage: Language,
): Promise<void> {
  const parsed = parseBookResponse(rawContent)
  const store = useLibraryStore.getState()

  const freshData = (await window.api.loadBookWithChapters(bookId)) as
    | { book: { id: string }; chapters: { id: string; chapterNumber: number }[] }
    | null
  const chapters = freshData?.chapters ?? []

  const writeOne = async (chapterNumber: number, content: string): Promise<void> => {
    const existing = chapters.find((c) => c.chapterNumber === chapterNumber)
    if (!existing) return
    const now = new Date().toISOString()
    await store.upsertChapterTranslation({
      id: crypto.randomUUID(),
      chapterId: existing.id,
      language: targetLanguage,
      content,
      status: 'completed',
      createdAt: now,
      updatedAt: now,
    })
  }

  if (parsed.chapters.length > 0) {
    for (const ch of parsed.chapters) {
      await writeOne(ch.chapterNumber, ch.content)
    }
  } else if (pendingChapterNumber !== undefined) {
    await writeOne(pendingChapterNumber, rawContent)
  }
}
