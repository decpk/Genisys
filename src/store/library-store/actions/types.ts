import type { ChapterTranslation, Language } from '@/store/library-store'

// Type aliases for the get/set functions used by store action functions.
// Kept loose to avoid a circular import on the full store state type.
export type LibraryGet = () => {
  chapterTranslations: Record<string, Record<string, ChapterTranslation>>
  activeChapterLanguage: Record<string, Language>
  generatingBookIds: Set<string>
}
export type LibrarySet = (
  partial:
    | Partial<{
        chapterTranslations: Record<string, Record<string, ChapterTranslation>>
        activeChapterLanguage: Record<string, Language>
        generatingBookIds: Set<string>
      }>
    | ((prev: any) => any),
) => void
