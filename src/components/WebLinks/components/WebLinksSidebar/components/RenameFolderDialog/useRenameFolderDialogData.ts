import { useCallback, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

import type { RenameFolderDialogViewModel } from './RenameFolderDialog.types'

/**
 * Seeds the name input from the folder whenever the dialog opens, then renames
 * the folder on submit and closes.
 */
export function useRenameFolderDialogData(
  folder: PreviewFolder,
  open: boolean,
  onOpenChange: (open: boolean) => void,
): RenameFolderDialogViewModel {
  const renameFolder = useWebLinksStore((state) => state.renameFolder)

  const [name, setName] = useState(folder.name)
  const [prevOpen, setPrevOpen] = useState(open)

  // Re-seed the input each time the dialog opens (render-phase pattern).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setName(folder.name)
  }

  const canSubmit = name.trim().length > 0

  const onNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      const trimmed = name.trim()
      if (!trimmed) return
      await renameFolder(folder.id, trimmed)
      onOpenChange(false)
    },
    [name, renameFolder, folder.id, onOpenChange],
  )

  return { name, canSubmit, onNameChange, onSubmit }
}
