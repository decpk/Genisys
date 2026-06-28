import type { ChapterTranslation } from '@/store/library-store'
import type { LibraryGet, LibrarySet } from './types'

export async function loadChapterTranslationsAction(
  get: LibraryGet,
  set: LibrarySet,
  chapterId: string,
): Promise<ChapterTranslation[]> {
  const rows = (await window.api.loadChapterTranslations(chapterId)) as ChapterTranslation[]
  const byLang: Record<string, ChapterTranslation> = {}
  for (const row of rows) byLang[row.language] = row

  const prev = get().chapterTranslations
  set({
    chapterTranslations: { ...prev, [chapterId]: byLang },
  })
  return rows
}
