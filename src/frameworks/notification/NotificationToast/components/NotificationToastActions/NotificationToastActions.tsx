import { cn } from '@/lib/utils'

import { notificationToastActionsStyles } from './NotificationToastActions.styles'
import type { NotificationToastActionsProps } from './NotificationToastActions.types'

export function NotificationToastActions(
  props: NotificationToastActionsProps,
): React.JSX.Element | null {
  const { actions, onDismiss } = props

  if (actions.length === 0) return null

  return (
    <div className={notificationToastActionsStyles.row}>
      {actions.map((action, i) => (
        <button
          key={i}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            action.onClick()
            onDismiss()
          }}
          className={cn(
            notificationToastActionsStyles.button,
            i > 0 && notificationToastActionsStyles.buttonDivider,
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
