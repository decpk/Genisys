import { useCallback } from 'react'

/**
 * Orchestrates the toast's interaction handlers:
 *   - `handleClose`   — idempotent dismiss (wired to the close button's
 *                       pointer-down AND click; see NotificationToastCloseButton).
 *   - `handleBodyClick` — exposed only when the toast is clickable; fires the
 *                       caller's `onClick` then dismisses.
 *   - `isClickable`   — whether the content area should behave as a button.
 */
export function useNotificationToastData(props: {
  onClick?: () => void
  onDismiss: () => void
}): {
  handleBodyClick: (() => void) | undefined
  handleClose: (e: React.SyntheticEvent) => void
  isClickable: boolean
} {
  const { onClick, onDismiss } = props

  const handleClose = useCallback(
    (e: React.SyntheticEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      onDismiss()
    },
    [onDismiss],
  )

  const handleBodyClick = useCallback((): void => {
    if (!onClick) return
    onClick()
    onDismiss()
  }, [onClick, onDismiss])

  return {
    handleBodyClick: onClick ? handleBodyClick : undefined,
    handleClose,
    isClickable: Boolean(onClick),
  }
}
