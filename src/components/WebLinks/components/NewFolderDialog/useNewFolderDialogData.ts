import { useCallback, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

import type { NewFolderDialogViewModel } from './NewFolderDialog.types'

/** Accent color presets offered when creating a folder. */
const FOLDER_COLOR_PRESETS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
] as const

/**
 * Manages the create-folder form. Resets on open, creates the folder on submit,
 * then notifies `onCreated` so callers can chain a follow-up action.
 */
export function useNewFolderDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onCreated?: (folder: PreviewFolder) => void,
): NewFolderDialogViewModel {
  const createFolder = useWebLinksStore((state) => state.createFolder)

  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(FOLDER_COLOR_PRESETS[0])
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset the form each time the dialog opens (render-phase pattern).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setName('')
      setColor(FOLDER_COLOR_PRESETS[0])
    }
  }

  const canSubmit = name.trim().length > 0

  const onNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  const onSelectColor = useCallback((next: string) => setColor(next), [])

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      const trimmed = name.trim()
      if (!trimmed) return
      const folder = await createFolder(trimmed, color)
      onOpenChange(false)
      onCreated?.(folder)
    },
    [name, color, createFolder, onOpenChange, onCreated],
  )

  return {
    name,
    color,
    colorPresets: FOLDER_COLOR_PRESETS,
    canSubmit,
    onNameChange,
    onSelectColor,
    onSubmit,
  }
}
