import type { QuitConfirmModalData } from '../QuitConfirmModal.types'

import { useQuitConfirmActions } from './useQuitConfirmActions'
import { useQuitConfirmIsOpen } from './useQuitConfirmIsOpen'

export function useQuitConfirmModalData(): QuitConfirmModalData {
  const isOpen = useQuitConfirmIsOpen()
  const { handleConfirm, handleCancel, handleOpenChange } = useQuitConfirmActions()
  return { isOpen, handleConfirm, handleCancel, handleOpenChange }
}
