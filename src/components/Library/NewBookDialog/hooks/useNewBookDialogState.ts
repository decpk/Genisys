import { useCallback, useState } from 'react'

import type { BookLength, WebpageSource } from '../../book-prompt'
import type { SourceType } from '../components/SourceTypePicker'
import { DEFAULT_ARTICLE_LENGTH, DEFAULT_BOOK_LENGTH, DEFAULT_MODEL } from '../NewBookDialog.constants'
import type { BookMode, ContentType } from '../NewBookDialog.types'
import type { Language } from '@/lib/languages'
import { saveLastBookLanguage } from '@/lib/lastBookLanguage'
import { useSettingsStore } from '@/store/settings-store'

export interface NewBookDialogStateApi {
  mode: BookMode
  contentType: ContentType
  sourceType: SourceType
  title: string
  description: string
  bookLength: BookLength
  model: string
  rawMarkdown: string
  selectedFiles: string[]
  webpageUrl: string
  urlError: string
  isCrawling: boolean
  crawledSource: WebpageSource | null
  language: Language
  setMode: React.Dispatch<React.SetStateAction<BookMode>>
  setContentType: (next: ContentType) => void
  setSourceType: React.Dispatch<React.SetStateAction<SourceType>>
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setBookLength: React.Dispatch<React.SetStateAction<BookLength>>
  setModel: React.Dispatch<React.SetStateAction<string>>
  setRawMarkdown: React.Dispatch<React.SetStateAction<string>>
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>
  setWebpageUrl: React.Dispatch<React.SetStateAction<string>>
  setUrlError: React.Dispatch<React.SetStateAction<string>>
  setIsCrawling: React.Dispatch<React.SetStateAction<boolean>>
  setCrawledSource: React.Dispatch<React.SetStateAction<WebpageSource | null>>
  setLanguage: (lang: Language) => void
  resetForm: () => void
}

export function useNewBookDialogState(): NewBookDialogStateApi {
  const [mode, setMode] = useState<BookMode>('ai')
  const [contentType, setContentTypeRaw] = useState<ContentType>('book')
  const [sourceType, setSourceType] = useState<SourceType>('topic')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [bookLength, setBookLength] = useState<BookLength>(DEFAULT_BOOK_LENGTH)
  const [model, setModel] = useState<string>(DEFAULT_MODEL)
  const [rawMarkdown, setRawMarkdown] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [webpageUrl, setWebpageUrl] = useState<string>('')
  const [urlError, setUrlError] = useState<string>('')
  const [isCrawling, setIsCrawling] = useState<boolean>(false)
  const [crawledSource, setCrawledSource] = useState<WebpageSource | null>(null)
  // Seed the dialog with the user's chosen default book language (Settings →
  // Library → Default book language). Reading from the store snapshot here is
  // fine because we only need the value at mount time; subsequent edits live
  // in local state.
  const [language, setLanguageRaw] = useState<Language>(
    () => useSettingsStore.getState().libraryDefaultLanguage,
  )

  const setLanguage = useCallback((lang: Language): void => {
    setLanguageRaw(lang)
    saveLastBookLanguage(lang)
  }, [])

  const setContentType = useCallback((next: ContentType): void => {
    setContentTypeRaw(next)
    setBookLength(next === 'article' ? DEFAULT_ARTICLE_LENGTH : DEFAULT_BOOK_LENGTH)
  }, [])

  const resetForm = useCallback((): void => {
    setMode('ai')
    setContentTypeRaw('book')
    setSourceType('topic')
    setTitle('')
    setDescription('')
    setBookLength(DEFAULT_BOOK_LENGTH)
    setModel(DEFAULT_MODEL)
    setRawMarkdown('')
    setSelectedFiles([])
    setWebpageUrl('')
    setUrlError('')
    setIsCrawling(false)
    setCrawledSource(null)
    // Re-seed language from the user's chosen default (Settings → Library →
    // Default book language) so each fresh dialog starts from the user's
    // preference rather than whatever was selected last.
    setLanguageRaw(useSettingsStore.getState().libraryDefaultLanguage)
  }, [])

  return {
    mode,
    contentType,
    sourceType,
    title,
    description,
    bookLength,
    model,
    rawMarkdown,
    selectedFiles,
    webpageUrl,
    urlError,
    isCrawling,
    crawledSource,
    language,
    setMode,
    setContentType,
    setSourceType,
    setTitle,
    setDescription,
    setBookLength,
    setModel,
    setRawMarkdown,
    setSelectedFiles,
    setWebpageUrl,
    setUrlError,
    setIsCrawling,
    setCrawledSource,
    setLanguage,
    resetForm,
  }
}
