import { useCallback } from 'react'

import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

export function useConfirmDialogData() {
  const isOpen = useConfirmDialogStore((s) => s.isOpen)
  const isLoading = useConfirmDialogStore((s) => s.isLoading)
  const title = useConfirmDialogStore((s) => s.title)
  const description = useConfirmDialogStore((s) => s.description)
  const confirmLabel = useConfirmDialogStore((s) => s.confirmLabel)
  const cancelLabel = useConfirmDialogStore((s) => s.cancelLabel)
  const variant = useConfirmDialogStore((s) => s.variant)
  const onConfirm = useConfirmDialogStore((s) => s.onConfirm)
  const secondaryActionLabel = useConfirmDialogStore((s) => s.secondaryActionLabel)
  const onSecondaryAction = useConfirmDialogStore((s) => s.onSecondaryAction)
  const closeConfirmDialog = useConfirmDialogStore((s) => s.closeConfirmDialog)
  const setLoading = useConfirmDialogStore((s) => s.setLoading)

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return
    setLoading(true)
    try {
      await onConfirm()
      closeConfirmDialog()
    } catch {
      setLoading(false)
    }
  }, [onConfirm, closeConfirmDialog, setLoading])

  const handleSecondary = useCallback(async () => {
    if (!onSecondaryAction) return
    setLoading(true)
    try {
      await onSecondaryAction()
      closeConfirmDialog()
    } catch {
      setLoading(false)
    }
  }, [onSecondaryAction, closeConfirmDialog, setLoading])

  const handleCancel = useCallback(() => {
    closeConfirmDialog()
  }, [closeConfirmDialog])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeConfirmDialog()
    },
    [closeConfirmDialog],
  )

  return {
    isOpen,
    isLoading,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    secondaryActionLabel,
    handleConfirm,
    handleSecondary,
    handleCancel,
    handleOpenChange,
  }
}
