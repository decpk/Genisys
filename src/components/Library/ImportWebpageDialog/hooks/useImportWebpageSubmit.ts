import { useCallback, useState } from 'react'

import { DEFAULT_LANGUAGE } from '@/lib/languages'
import { useLibraryStore } from '@/store/library-store'
import type { BookMeta } from '@/store/library-store'
import { useWebpageStore } from '@/store/webpage-store'

import { crawlWebpageContent } from '../api/crawlWebpageContent'
import { DEFAULT_BOOK_TITLE } from '../ImportWebpageDialog.constants'
import type {
  ImportDestination,
  ImportSource,
} from '../ImportWebpageDialog.types'
import { buildChaptersFromMarkdown } from '../utils/buildChaptersFromMarkdown'
import { extractTitleFromHtml } from '../utils/extractTitleFromHtml'
import { htmlToMarkdown } from '../utils/htmlToMarkdown'
import { isValidUrl } from '../utils/isValidUrl'

export interface ImportWebpageSubmitDeps {
  source: ImportSource
  destination: ImportDestination
  url: string
  html: string
  fileContent: string
  name: string
  setError: (error: string) => void
  resetForm: () => void
  onOpenChange: (open: boolean) => void
}

export interface ImportWebpageSubmitApi {
  handleImport: () => Promise<void>
  isSubmitting: boolean
}

interface ResolvedSource {
  htmlString: string
  trimmedUrl: string
}

/** Validate the active source and return the resolved inputs, or null on error. */
function resolveSource(
  deps: ImportWebpageSubmitDeps,
): ResolvedSource | null {
  const { source, url, html, fileContent, setError } = deps

  if (source === 'url') {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setError('Please enter a URL')
      return null
    }
    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid HTTP or HTTPS URL')
      return null
    }
    return { htmlString: '', trimmedUrl }
  }

  if (source === 'html') {
    const trimmedHtml = html.trim()
    if (!trimmedHtml) {
      setError('Please paste some HTML to import')
      return null
    }
    return { htmlString: trimmedHtml, trimmedUrl: '' }
  }

  // source === 'file'
  if (!fileContent.trim()) {
    setError('Please select an .html or .htm file to import')
    return null
  }
  return { htmlString: fileContent, trimmedUrl: '' }
}

export function useImportWebpageSubmit(
  deps: ImportWebpageSubmitDeps,
): ImportWebpageSubmitApi {
  const { source, destination, name, setError, resetForm, onOpenChange } = deps

  const [isSubmitting, setIsSubmitting] = useState(false)

  const saveWebpage = useWebpageStore((s) => s.saveWebpage)
  const saveWebpageFromHtml = useWebpageStore((s) => s.saveWebpageFromHtml)
  const selectWebpage = useWebpageStore((s) => s.selectWebpage)

  const createBook = useLibraryStore((s) => s.createBook)
  const selectBook = useLibraryStore((s) => s.selectBook)
  const addChapter = useLibraryStore((s) => s.addChapter)
  const updateBookStatus = useLibraryStore((s) => s.updateBookStatus)

  const createBookFromMarkdown = useCallback(
    async (title: string, markdown: string): Promise<BookMeta> => {
      const book = await createBook(title, '', '', DEFAULT_LANGUAGE)
      await selectBook(book.id)
      const chapters = buildChaptersFromMarkdown(markdown, book.id, DEFAULT_LANGUAGE)
      for (const chapter of chapters) {
        await addChapter(chapter)
      }
      await updateBookStatus(book.id, 'completed')
      return book
    },
    [createBook, selectBook, addChapter, updateBookStatus],
  )

  const importToPage = useCallback(
    async (resolved: ResolvedSource): Promise<void> => {
      const trimmedName = name.trim()
      if (source === 'url') {
        const webpage = await saveWebpage(resolved.trimmedUrl, trimmedName)
        selectWebpage(webpage.id)
        return
      }
      const webpage = await saveWebpageFromHtml(resolved.htmlString, trimmedName, '')
      selectWebpage(webpage.id)
    },
    [source, name, saveWebpage, saveWebpageFromHtml, selectWebpage],
  )

  const importToBook = useCallback(
    async (resolved: ResolvedSource): Promise<void> => {
      const trimmedName = name.trim()
      let markdown: string
      let bookTitle: string

      if (source === 'url') {
        const crawled = await crawlWebpageContent(resolved.trimmedUrl)
        markdown = crawled.content
        bookTitle = trimmedName || crawled.title || DEFAULT_BOOK_TITLE
      } else {
        markdown = htmlToMarkdown(resolved.htmlString)
        bookTitle =
          trimmedName ||
          extractTitleFromHtml(resolved.htmlString) ||
          DEFAULT_BOOK_TITLE
      }

      if (!markdown.trim()) {
        throw new Error('No readable content was found to build a book')
      }

      await createBookFromMarkdown(bookTitle, markdown)
    },
    [source, name, createBookFromMarkdown],
  )

  const handleImport = useCallback(async () => {
    const resolved = resolveSource(deps)
    if (!resolved) return

    setError('')
    setIsSubmitting(true)
    try {
      if (destination === 'page') {
        await importToPage(resolved)
      } else {
        await importToBook(resolved)
      }
      resetForm()
      onOpenChange(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to import content'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [deps, destination, setError, importToPage, importToBook, resetForm, onOpenChange])

  return { handleImport, isSubmitting }
}
