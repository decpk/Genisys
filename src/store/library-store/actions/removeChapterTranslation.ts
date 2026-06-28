import type { Language } from '@/lib/languages'
import type { LibraryGet, LibrarySet } from './types'

export async function removeChapterTranslationAction(
  get: LibraryGet,
  set: LibrarySet,
  chapterId: string,
  language: Language,
): Promise<void> {
  const prev = get().chapterTranslations
  const forChapter = { ...(prev[chapterId] ?? {}) }
  delete forChapter[language]
  set({
    chapterTranslations: { ...prev, [chapterId]: forChapter },
  })
  await window.api.removeChapterTranslation(chapterId, language)
}
