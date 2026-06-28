import { useState, useCallback } from 'react'

import type { DeleteConfirmDialogProps } from './DeleteConfirmDialog.types'

export function useDeleteConfirmDialogData(props: DeleteConfirmDialogProps) {
  const { onConfirm, onOpenChange } = props
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = useCallback(async () => {
    setIsPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }, [onConfirm, onOpenChange])

  return { isPending, handleConfirm }
}
