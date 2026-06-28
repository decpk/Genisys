import { useCallback } from 'react'

import type { VSCodeCLIMissingDialogProps } from './VSCodeCLIMissingDialog.types'

export function useVSCodeCLIMissingDialogData(props: VSCodeCLIMissingDialogProps) {
  const { onRetry, onOpenChange } = props

  const handleRetry = useCallback(() => {
    onOpenChange(false)
    onRetry()
  }, [onRetry, onOpenChange])

  return { handleRetry }
}
