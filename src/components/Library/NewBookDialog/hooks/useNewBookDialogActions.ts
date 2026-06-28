import { useCallback } from 'react'

import { useLibraryStore } from '@/store/library-store'
import type { Language } from '@/lib/languages'

import { parseBookResponse } from '../../book-parser'
import type { BookLength, WebpageSource } from '../../book-prompt'
import { useBookGeneratorContext } from '../../BookGeneratorContext'
import { parseMarkdownByChapterMarker, parseMarkdownToChapters } from '../../md-book-parser'
import type { SourceType } from '../components/SourceTypePicker'
import type { BookMode, ContentType } from '../NewBookDialog.types'
import { deriveBookDescription } from '../utils/deriveBookDescription'
import { deriveBookTitle } from '../utils/deriveBookTitle'
import { extractTitleFromMarkdown } from '../utils/extractTitleFromMarkdown'
import { hasAIBookFormat } from '../utils/hasAIBookFormat'

import type { CrawlResult } from './useWebpageCrawl'

export interface ActionsDeps {
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
  isCrawling: boolean
  language: Language
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setRawMarkdown: React.Dispatch<React.SetStateAction<string>>
  setIsCrawling: React.Dispatch<React.SetStateAction<boolean>>
  setUrlError: React.Dispatch<React.SetStateAction<string>>
  setCrawledSource: React.Dispatch<React.SetStateAction<WebpageSource | null>>
  resetForm: () => void
  crawl: (url: string) => Promise<CrawlResult>
  onOpenChange: (open: boolean) => void
}

export interface ActionsApi {
  handleCreateAI: () => Promise<void>
  handleCreateFromMarkdown: () => Promise<void>
  handleCreateFromLocalFiles: () => Promise<void>
  handleCreate: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleRawMarkdownChange: (md: string) => void
  isCreateDisabled: boolean
}

interface ParsedChapter {
  chapterNumber: number
  title: string
  content: string
}

interface ParsedSource {
  chapters: ParsedChapter[]
  metaTitle?: string
}

function parseCombinedMarkdown(md: string): ParsedSource {
  if (hasAIBookFormat(md)) {
    const parsed = parseBookResponse(md)
    return { chapters: parsed.chapters, metaTitle: parsed.meta?.bookTitle }
  }
  return { chapters: parseMarkdownToChapters(md) }
}

// Raw Markdown editor uses the explicit `<lib-chapter-break />` element so real `#`
// headings inside content are not treated as chapter breaks.
function parseRawEditorMarkdown(md: string): ParsedSource {
  if (hasAIBookFormat(md)) {
    const parsed = parseBookResponse(md)
    return { chapters: parsed.chapters, metaTitle: parsed.meta?.bookTitle }
  }
  return { chapters: parseMarkdownByChapterMarker(md) }
}

export function useNewBookDialogActions(deps: ActionsDeps): ActionsApi {
  const {
    mode,
    sourceType,
    title,
    description,
    bookLength,
    model,
    rawMarkdown,
    selectedFiles,
    webpageUrl,
    language,
    isCrawling,
    setTitle,
    setRawMarkdown,
    setIsCrawling,
    setUrlError,
    setCrawledSource,
    resetForm,
    crawl,
    onOpenChange,
  } = deps

  const createBook = useLibraryStore((s) => s.createBook)
  const selectBook = useLibraryStore((s) => s.selectBook)
  const addChapter = useLibraryStore((s) => s.addChapter)
  const updateBookStatus = useLibraryStore((s) => s.updateBookStatus)
  const { generateBook } = useBookGeneratorContext()

  const handleCreateAI = useCallback(async (): Promise<void> => {
    if (sourceType === 'webpage') {
      setIsCrawling(true)
      setUrlError('')

      const result = await crawl(webpageUrl)
      if (!result.ok) {
        setIsCrawling(false)
        setUrlError(result.error)
        return
      }

      const { source } = result
      const bookTitle = deriveBookTitle(title, source.title)
      const bookDescription = deriveBookDescription(description, source.description)

      setCrawledSource(source)

      const book = await createBook(bookTitle, bookDescription, model, language)
      setIsCrawling(false)
      resetForm()
      onOpenChange(false)
      await selectBook(book.id)
      generateBook(book.id, bookTitle, bookLength, model, source, language)
      return
    }

    // Topic flow
    const topic = title.trim()
    if (!topic) return
    const book = await createBook(topic, description.trim(), model, language)
    resetForm()
    onOpenChange(false)
    await selectBook(book.id)
    generateBook(book.id, topic, bookLength, model, undefined, language)
  }, [
    sourceType,
    title,
    description,
    bookLength,
    model,
    language,
    webpageUrl,
    crawl,
    setIsCrawling,
    setUrlError,
    setCrawledSource,
    createBook,
    selectBook,
    generateBook,
    resetForm,
    onOpenChange,
  ])

  const handleCreateFromMarkdown = useCallback(async (): Promise<void> => {
    if (!rawMarkdown.trim()) return

    const { chapters, metaTitle } = parseRawEditorMarkdown(rawMarkdown)
    if (chapters.length === 0) return

    const bookTitle = title.trim() || metaTitle || extractTitleFromMarkdown(rawMarkdown)
    const book = await createBook(bookTitle, description.trim(), '', language)
    resetForm()
    onOpenChange(false)
    await selectBook(book.id)

    for (const ch of chapters) {
      await addChapter({
        bookId: book.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        content: ch.content,
        status: 'completed',
        sortOrder: ch.chapterNumber,
        isRead: false,
        language,
      })
    }

    await updateBookStatus(book.id, 'completed')
  }, [
    rawMarkdown,
    title,
    description,
    language,
    createBook,
    selectBook,
    addChapter,
    updateBookStatus,
    resetForm,
    onOpenChange,
  ])

  const handleCreateFromLocalFiles = useCallback(async (): Promise<void> => {
    if (selectedFiles.length === 0) return

    const fileContents: string[] = []
    for (const filePath of selectedFiles) {
      const result = await window.api.readTextFile(filePath)
      if (result.success && result.data) {
        fileContents.push(result.data)
      }
    }
    if (fileContents.length === 0) return

    const combined = fileContents.join('\n\n')
    const { chapters, metaTitle } = parseCombinedMarkdown(combined)
    if (chapters.length === 0) return

    const bookTitle = title.trim() || metaTitle || extractTitleFromMarkdown(combined)
    const book = await createBook(bookTitle, description.trim(), '', language)
    resetForm()
    onOpenChange(false)
    await selectBook(book.id)

    for (const ch of chapters) {
      await addChapter({
        bookId: book.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        content: ch.content,
        status: 'completed',
        sortOrder: ch.chapterNumber,
        isRead: false,
        language,
      })
    }

    await updateBookStatus(book.id, 'completed')
  }, [
    selectedFiles,
    title,
    description,
    language,
    createBook,
    selectBook,
    addChapter,
    updateBookStatus,
    resetForm,
    onOpenChange,
  ])

  const handleCreate = useCallback(async (): Promise<void> => {
    if (mode === 'ai') {
      await handleCreateAI()
    } else if (mode === 'local-md') {
      await handleCreateFromLocalFiles()
    } else {
      await handleCreateFromMarkdown()
    }
  }, [mode, handleCreateAI, handleCreateFromLocalFiles, handleCreateFromMarkdown])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' && !e.shiftKey && mode === 'ai') {
        e.preventDefault()
        void handleCreate()
      }
    },
    [mode, handleCreate],
  )

  const handleRawMarkdownChange = useCallback(
    (md: string): void => {
      setRawMarkdown(md)
      if (!title.trim() && md.trim()) {
        setTitle(extractTitleFromMarkdown(md))
      }
    },
    [title, setRawMarkdown, setTitle],
  )

  const isCreateDisabled = computeIsCreateDisabled({
    mode,
    sourceType,
    title,
    rawMarkdown,
    selectedFiles,
    webpageUrl,
    isCrawling,
  })

  return {
    handleCreateAI,
    handleCreateFromMarkdown,
    handleCreateFromLocalFiles,
    handleCreate,
    handleKeyDown,
    handleRawMarkdownChange,
    isCreateDisabled,
  }
}

function computeIsCreateDisabled(args: {
  mode: BookMode
  sourceType: SourceType
  title: string
  rawMarkdown: string
  selectedFiles: string[]
  webpageUrl: string
  isCrawling: boolean
}): boolean {
  const { mode, sourceType, title, rawMarkdown, selectedFiles, webpageUrl, isCrawling } = args
  if (mode === 'raw-md') return rawMarkdown.trim() === ''
  if (mode === 'local-md') return selectedFiles.length === 0
  // mode === 'ai'
  if (sourceType === 'webpage') return webpageUrl.trim() === '' || isCrawling
  return title.trim() === ''
}
