import { useEffect, useMemo, useState, useCallback } from 'react'

import { useLibraryStore, type Chapter, type ChapterTranslation } from '@/store/library-store'
import { type Language } from '@/lib/languages'
import { saveLastBookLanguage } from '@/lib/lastBookLanguage'

import { useBookGeneratorContext } from '../BookGeneratorContext'

export interface ChapterLanguageState {
  activeLanguage: Language;
  displayContent: string;
  translations: ChapterTranslation[];
  isTranslating: boolean;
  selectLanguage: (language: Language) => void;
  translateChapter: (language: Language) => void;
  translateBook: (language: Language) => void;
  deleteTranslation: (language: Language) => void;
}

/**
 * Resolves the chapter content shown in the viewer based on the active
 * reading language. Lazily loads translation rows / content when needed.
 */
export function useChapterLanguageData(chapter: Chapter): ChapterLanguageState {
  const activeLanguage = useLibraryStore((s) => s.activeChapterLanguage[chapter.id] ?? chapter.language)
  const setActiveChapterLanguage = useLibraryStore((s) => s.setActiveChapterLanguage)
  const translationsByChapter = useLibraryStore((s) => s.chapterTranslations[chapter.id])
  const loadChapterTranslations = useLibraryStore((s) => s.loadChapterTranslations)
  const loadChapterTranslationContent = useLibraryStore((s) => s.loadChapterTranslationContent)
  const removeChapterTranslation = useLibraryStore((s) => s.removeChapterTranslation)
  const activeBook = useLibraryStore((s) => s.activeBook)
  const { generateChapterTranslation, generateBookTranslation } = useBookGeneratorContext()

  const translations = useMemo<ChapterTranslation[]>(() => {
    if (!translationsByChapter) return []
    return Object.values(translationsByChapter)
  }, [translationsByChapter])

  const [contentCache, setContentCache] = useState<Record<string, string>>({})

  // Load translation list metadata when chapter changes
  useEffect(() => {
    if (!translationsByChapter) {
      void loadChapterTranslations(chapter.id)
    }
  }, [chapter.id, translationsByChapter, loadChapterTranslations])

  // Lazy-load content for active language if it's a translation
  useEffect(() => {
    if (activeLanguage === chapter.language) return
    if (contentCache[activeLanguage] !== undefined) return
    const meta = translationsByChapter?.[activeLanguage]
    if (!meta || meta.status !== 'completed') return
    if (meta.content) {
      setContentCache((c) => ({ ...c, [activeLanguage]: meta.content }))
      return
    }
    void loadChapterTranslationContent(chapter.id, activeLanguage).then((text) => {
      if (text !== null) {
        setContentCache((c) => ({ ...c, [activeLanguage]: text }))
      }
    })
  }, [activeLanguage, chapter.id, chapter.language, translationsByChapter, contentCache, loadChapterTranslationContent])

  const displayContent = useMemo(() => {
    if (activeLanguage === chapter.language) return chapter.content
    const fromCache = contentCache[activeLanguage]
    if (fromCache !== undefined) return fromCache
    const inline = translationsByChapter?.[activeLanguage]?.content
    return inline ?? ''
  }, [activeLanguage, chapter.language, chapter.content, contentCache, translationsByChapter])

  const selectLanguage = useCallback(
    (language: Language) => {
      setActiveChapterLanguage(chapter.id, language)
      saveLastBookLanguage(language)
    },
    [chapter.id, setActiveChapterLanguage],
  )

  const translateChapter = useCallback(
    (language: Language) => {
      if (!activeBook) return
      generateChapterTranslation(activeBook.book.id, chapter.chapterNumber, language)
      setActiveChapterLanguage(chapter.id, language)
    },
    [activeBook, chapter.id, chapter.chapterNumber, generateChapterTranslation, setActiveChapterLanguage],
  )

  const translateBook = useCallback(
    (language: Language) => {
      if (!activeBook) return
      generateBookTranslation(activeBook.book.id, language)
      setActiveChapterLanguage(chapter.id, language)
    },
    [activeBook, chapter.id, generateBookTranslation, setActiveChapterLanguage],
  )

  const deleteTranslation = useCallback(
    (language: Language) => {
      if (language === chapter.language) return
      void removeChapterTranslation(chapter.id, language)
      setContentCache((c) => {
        if (c[language] === undefined) return c
        const next = { ...c }
        delete next[language]
        return next
      })
      if (activeLanguage === language) {
        setActiveChapterLanguage(chapter.id, chapter.language)
      }
    },
    [chapter.id, chapter.language, activeLanguage, removeChapterTranslation, setActiveChapterLanguage],
  )

  return {
    activeLanguage,
    displayContent,
    translations,
    isTranslating:
      activeLanguage !== chapter.language &&
      translationsByChapter?.[activeLanguage]?.status === "generating",
    selectLanguage,
    translateChapter,
    translateBook,
    deleteTranslation,
  };
}
