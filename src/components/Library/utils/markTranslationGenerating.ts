import type { Language } from '@/lib/languages'
import { useLibraryStore } from '@/store/library-store'

/**
 * Pre-create a `chapter_translations` row for a given chapter at a target
 * language with status='generating', so that the chapter viewer can show a
 * spinner while the translation is being produced.
 */
export async function markTranslationGenerating(
  chapterId: string,
  targetLanguage: Language,
): Promise<void> {
  const now = new Date().toISOString()
  await useLibraryStore.getState().upsertChapterTranslation({
    id: crypto.randomUUID(),
    chapterId,
    language: targetLanguage,
    content: '',
    status: 'generating',
    createdAt: now,
    updatedAt: now,
  })
}
