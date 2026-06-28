import { useState, useCallback } from 'react'

import { useWebpageStore } from '@/store/webpage-store'
import type { SavedWebpage } from '@/store/webpage-store'

/**
 * Persists the current draft HTML via the store. On success the saved value
 * is handed back so the caller can clear the dirty state.
 */
export function useWebpageEditorSave(
  webpage: SavedWebpage | null,
  draft: string,
  onSaved: (value: string) => void,
) {
  const [isSaving, setIsSaving] = useState(false)
  const updateWebpageContent = useWebpageStore((s) => s.updateWebpageContent)

  const handleSave = useCallback(async () => {
    if (!webpage) return
    setIsSaving(true)
    try {
      await updateWebpageContent(webpage.id, draft)
      onSaved(draft)
    } catch (e) {
      console.error('[WebpageEditorModal] Failed to save html:', e)
    } finally {
      setIsSaving(false)
    }
  }, [webpage, draft, updateWebpageContent, onSaved])

  return { isSaving, handleSave }
}
