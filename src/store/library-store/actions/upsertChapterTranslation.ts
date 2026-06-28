import type { ChapterTranslation } from '@/store/library-store'
import type { LibraryGet, LibrarySet } from './types'

export async function upsertChapterTranslationAction(
  get: LibraryGet,
  set: LibrarySet,
  translation: ChapterTranslation,
): Promise<void> {
  const prev = get().chapterTranslations
  const forChapter = { ...(prev[translation.chapterId] ?? {}), [translation.language]: translation }
  set({
    chapterTranslations: { ...prev, [translation.chapterId]: forChapter },
  })
  await window.api.saveChapterTranslation(translation)
}
