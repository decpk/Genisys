import type { Language } from '@/lib/languages'
import type { LibraryGet, LibrarySet } from './types'

export async function loadChapterTranslationContentAction(
  get: LibraryGet,
  set: LibrarySet,
  chapterId: string,
  language: Language,
): Promise<string | null> {
  const content = (await window.api.loadChapterTranslationContent(chapterId, language)) as
    | string
    | null
  if (content === null || content === undefined) return null

  const prev = get().chapterTranslations
  const existing = prev[chapterId]?.[language]
  if (!existing) return content
  set({
    chapterTranslations: {
      ...prev,
      [chapterId]: { ...prev[chapterId], [language]: { ...existing, content } },
    },
  })
  return content
}
