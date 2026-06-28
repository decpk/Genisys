import type { Language } from '@/lib/languages'
import type { Chapter, ChapterTranslation } from '@/store/library-store'

export interface ChapterLanguagePillsProps {
  chapter: Chapter
  activeLanguage: Language
  translations: ChapterTranslation[]
  visible: boolean
  onSelectLanguage: (language: Language) => void
  onTranslateChapter: (language: Language) => void
  onTranslateBook: (language: Language) => void
  onDeleteTranslation: (language: Language) => void
}
