import { useState, useEffect, useCallback } from 'react'
import { readText } from '@tauri-apps/plugin-clipboard-manager'

import { useApiClientStore } from '@/store/api-client-store'
import { notify } from '@/frameworks/notification/notify'
import { pickCollectionFile } from './api/pickCollectionFile'
import { buildCollectionImportPreview } from './utils/buildCollectionImportPreview'
import { formatCollectionImportError } from './utils/formatCollectionImportError'
import type { CollectionImportPreviewData } from './ImportCollectionDialog.types'

const PREVIEW_DEBOUNCE_MS = 250

interface UseImportCollectionDialogData {
  content: string
  fileName: string | null
  preview: CollectionImportPreviewData | null
  previewError: string | null
  parsing: boolean
  importing: boolean
  importError: string | null
  handleContentChange: (value: string) => void
  handlePickFile: () => Promise<void>
  handlePasteFromClipboard: () => Promise<void>
  handleClear: () => void
  handleImport: () => Promise<void>
}

export function useImportCollectionDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): UseImportCollectionDialogData {
  const importCollection = useApiClientStore((s) => s.importCollection)
  const setActiveCollectionId = useApiClientStore((s) => s.setActiveCollectionId)

  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<CollectionImportPreviewData | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleContentChange = useCallback((value: string) => {
    setContent(value)
    setFileName(null)
    setImportError(null)
  }, [])

  const handlePickFile = useCallback(async () => {
    try {
      const picked = await pickCollectionFile()
      if (!picked) return
      const segments = picked.path.split(/[\\/]/)
      setContent(picked.content)
      setFileName(segments[segments.length - 1] || picked.path)
      setImportError(null)
    } catch (err) {
      setPreviewError(formatCollectionImportError(err))
    }
  }, [])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await readText()
      if (!text) return
      setContent(text)
      setFileName(null)
      setImportError(null)
    } catch {
      // Clipboard read can fail without permission — silently ignore.
    }
  }, [])

  const handleClear = useCallback(() => {
    setContent('')
    setFileName(null)
    setPreview(null)
    setPreviewError(null)
    setImportError(null)
  }, [])

  const handleImport = useCallback(async () => {
    if (!content.trim() || !preview || importing) return

    setImporting(true)
    setImportError(null)
    try {
      const result = await importCollection(preview.format, content)
      setActiveCollectionId(result.collectionId)
      notify({
        source: 'api-client',
        type: 'success',
        message: `Imported "${result.collectionName}" — ${result.requestCount} requests`,
      })
      onOpenChange(false)
    } catch (err) {
      const message = formatCollectionImportError(err)
      setImportError(message)
      notify({ source: 'api-client', type: 'error', message })
      setImporting(false)
    }
  }, [content, preview, importing, importCollection, setActiveCollectionId, onOpenChange])

  // Debounced preview computation whenever the content changes.
  useEffect(() => {
    if (!content.trim()) {
      setPreview(null)
      setPreviewError(null)
      setParsing(false)
      return
    }

    let cancelled = false
    setParsing(true)

    const timer = window.setTimeout(() => {
      buildCollectionImportPreview(content)
        .then((next) => {
          if (cancelled) return
          setPreview(next)
          setPreviewError(null)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setPreview(null)
          setPreviewError(formatCollectionImportError(err))
        })
        .finally(() => {
          if (cancelled) return
          setParsing(false)
        })
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [content])

  // Reset all transient state when the dialog closes.
  useEffect(() => {
    if (open) return
    setContent('')
    setFileName(null)
    setPreview(null)
    setPreviewError(null)
    setParsing(false)
    setImporting(false)
    setImportError(null)
  }, [open])

  return {
    content,
    fileName,
    preview,
    previewError,
    parsing,
    importing,
    importError,
    handleContentChange,
    handlePickFile,
    handlePasteFromClipboard,
    handleClear,
    handleImport,
  }
}
