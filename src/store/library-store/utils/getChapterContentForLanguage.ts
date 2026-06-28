import type { Chapter, ChapterTranslation } from '@/store/library-store'
import type { Language } from '@/lib/languages'

/**
 * Resolve the content to render for a chapter at a given language.
 * - If language matches the chapter's primary language, returns chapter.content.
 * - Else returns the translation row's content (may be empty string while loading).
 * - Returns null when no source/translation exists yet.
 */
export function getChapterContentForLanguage(
  chapter: Chapter,
  language: Language,
  translationsByLang: Record<string, ChapterTranslation> | undefined,
): string | null {
  if (chapter.language === language) return chapter.content ?? ''
  const tr = translationsByLang?.[language]
  if (!tr) return null
  return tr.content ?? ''
}
