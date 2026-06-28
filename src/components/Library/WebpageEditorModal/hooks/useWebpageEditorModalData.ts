import { useCallback } from 'react'

import type { SavedWebpage } from '@/store/webpage-store'

import { useWebpageEditorContent } from './useWebpageEditorContent'
import { useWebpageEditorSave } from './useWebpageEditorSave'
import { useWebpageEditorKeyboard } from './useWebpageEditorKeyboard'

/**
 * Orchestrates the HTML editor modal: loads content, tracks dirty state,
 * saves via the store, and wires the Cmd/Ctrl+S shortcut.
 */
export function useWebpageEditorModalData(
  webpage: SavedWebpage | null,
  open: boolean,
  onOpenChange: (open: boolean) => void,
) {
  const { draft, setDraft, isDirty, isLoading, resetBaseline } =
    useWebpageEditorContent(webpage, open)

  const { isSaving, handleSave } = useWebpageEditorSave(
    webpage,
    draft,
    resetBaseline,
  )

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    onOpenChange(false)
  }, [handleSave, onOpenChange])

  const { handleEditorMount } = useWebpageEditorKeyboard(handleSaveAndClose)

  return {
    draft,
    setDraft,
    isDirty,
    isLoading,
    isSaving,
    handleSaveAndClose,
    handleEditorMount,
  }
}
