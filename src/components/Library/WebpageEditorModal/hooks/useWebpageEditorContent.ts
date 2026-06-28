import { useState, useEffect, useCallback } from 'react'

import type { SavedWebpage } from '@/store/webpage-store'

import { loadWebpageHtml } from '../api/loadWebpageHtml'

/**
 * Loads the saved HTML for a webpage and tracks the editor draft + dirty
 * state. Reloads whenever the modal opens for a (different) webpage.
 */
export function useWebpageEditorContent(
  webpage: SavedWebpage | null,
  open: boolean,
) {
  const [original, setOriginal] = useState('')
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isDirty = draft !== original

  useEffect(() => {
    if (!open || !webpage) return

    const targetId = webpage.id
    let cancelled = false

    async function load(): Promise<void> {
      setIsLoading(true)
      try {
        const html = await loadWebpageHtml(targetId)
        if (cancelled) return
        setOriginal(html)
        setDraft(html)
      } catch (e) {
        if (!cancelled) {
          console.error('[WebpageEditorModal] Failed to load html:', e)
          setOriginal('')
          setDraft('')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, webpage])

  // Adopt a freshly-saved value as the new baseline (clears dirty state).
  const resetBaseline = useCallback((value: string) => {
    setOriginal(value)
    setDraft(value)
  }, [])

  return { draft, setDraft, isDirty, isLoading, resetBaseline }
}
