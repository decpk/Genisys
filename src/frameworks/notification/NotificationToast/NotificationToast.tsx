import { memo } from 'react'

import { cn } from '@/lib/utils'

import { NotificationToastActions } from './components/NotificationToastActions'
import { NotificationToastBody } from './components/NotificationToastBody'
import { NotificationToastCloseButton } from './components/NotificationToastCloseButton'
import { NotificationToastLeading } from './components/NotificationToastLeading'
import { notificationToastStyles } from './NotificationToast.styles'
import type { NotificationToastProps } from './NotificationToast.types'
import { useNotificationToastData } from './useNotificationToastData'
import { getNotificationElevation } from './utils/getNotificationElevation'

export const NotificationToast = memo(function NotificationToast(
  props: NotificationToastProps,
): React.JSX.Element {
  const { type, appName, title, message, loading, icon, avatar, onClick, actions, onDismiss } = props
  const { handleBodyClick, handleClose, isClickable } = useNotificationToastData({ onClick, onDismiss })

  // Root keeps the `notification-toast` class (CSS animation hook in
  // notification.css) and `group` (hover reveals close + "now"); elevation is
  // composed via the pure `getNotificationElevation()` so the highlight pops on
  // light AND dark surfaces.
  const rootClass = cn(notificationToastStyles.root, getNotificationElevation())
  const contentClass = cn(
    notificationToastStyles.content,
    isClickable && notificationToastStyles.contentClickable,
  )
  const role = isClickable ? 'button' : undefined

  return (
    <div className={rootClass}>
      <div className={contentClass} onClick={handleBodyClick} role={role}>
        <NotificationToastLeading type={type} loading={loading} icon={icon} avatar={avatar} />
        <NotificationToastBody appName={appName} title={title} message={message} />
      </div>

      {/* Close — reveals on hover and dismisses on BOTH pointer-down (fires
          before Sonner starts swipe-tracking) and click (keyboard activation).
          Full rationale lives in NotificationToastCloseButton. */}
      <NotificationToastCloseButton onClose={handleClose} />

      <NotificationToastActions actions={actions} onDismiss={onDismiss} />
    </div>
  )
})
