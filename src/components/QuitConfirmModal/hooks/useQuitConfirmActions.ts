import { useCallback } from 'react'

import { performQuit } from '@/keyboard-shortcut-impl/window-actions/utils/performQuit'
import { useQuitConfirmStore } from '@/store/quit-confirm-store'

export interface QuitConfirmActionHandlers {
  handleConfirm: () => void
  handleCancel: () => void
  handleOpenChange: (open: boolean) => void
}

export function useQuitConfirmActions(): QuitConfirmActionHandlers {
  const closeQuitConfirm = useQuitConfirmStore((s) => s.closeQuitConfirm)

  const handleConfirm = useCallback(() => {
    void performQuit()
  }, [])

  const handleCancel = useCallback(() => {
    closeQuitConfirm()
  }, [closeQuitConfirm])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeQuitConfirm()
    },
    [closeQuitConfirm]
  )

  return { handleConfirm, handleCancel, handleOpenChange }
}
