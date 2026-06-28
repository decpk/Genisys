import { useState, useEffect, useCallback } from 'react'

import { useWebpageStore } from '@/store/webpage-store'
import type { SavedWebpage } from '@/store/webpage-store'

export function useRenameWebpageDialogData(
  webpage: SavedWebpage | null,
  onOpenChange: (open: boolean) => void,
) {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const renameWebpage = useWebpageStore((s) => s.renameWebpage)

  // Seed the input from the active webpage each time it changes.
  useEffect(() => {
    if (webpage) {
      setName(webpage.name)
    }
  }, [webpage])

  const handleSave = useCallback(async () => {
    if (!webpage) return
    const trimmed = name.trim()
    if (!trimmed) return
    setIsSaving(true)
    try {
      await renameWebpage(webpage.id, trimmed)
      onOpenChange(false)
    } catch (e) {
      console.error('[RenameWebpageDialog] Failed to rename:', e)
    } finally {
      setIsSaving(false)
    }
  }, [webpage, name, renameWebpage, onOpenChange])

  return { name, setName, isSaving, handleSave }
}
