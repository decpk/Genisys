import { X } from 'lucide-react'

import { notificationToastCloseButtonStyles } from './NotificationToastCloseButton.styles'
import type { NotificationToastCloseButtonProps } from './NotificationToastCloseButton.types'

export function NotificationToastCloseButton(
  props: NotificationToastCloseButtonProps,
): React.JSX.Element {
  const { onClose } = props

  // IMPORTANT — dismiss on BOTH `onPointerDown` and `onClick`.
  // Pointer-down is the first event in the gesture (before Sonner's toast-level
  // pointer-capture / swipe-tracking kicks in) and `preventDefault` +
  // `stopPropagation` keep Sonner from swipe-tracking this control; `onClick`
  // covers keyboard activation. `toast.dismiss` is idempotent, so the double
  // call when both fire is harmless. Removing either handler reintroduces a
  // known click-to-dismiss bug.
  return (
    <button
      type="button"
      onPointerDown={onClose}
      onClick={onClose}
      aria-label="Dismiss notification"
      className={notificationToastCloseButtonStyles.button}
    >
      <X size={12} strokeWidth={2.5} className="pointer-events-none" />
    </button>
  )
}
