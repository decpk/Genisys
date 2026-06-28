import { cn } from '@/lib/utils'

import { notificationToastBodyStyles } from './NotificationToastBody.styles'
import type { NotificationToastBodyProps } from './NotificationToastBody.types'

export function NotificationToastBody(props: NotificationToastBodyProps): React.JSX.Element {
  const { appName, title, message } = props

  const appNameVariant = title
    ? notificationToastBodyStyles.appNameWithTitle
    : notificationToastBodyStyles.appNameNoTitle
  const appNameClass = cn(notificationToastBodyStyles.appName, appNameVariant)

  const titleEl = title ? (
    <p className={notificationToastBodyStyles.title}>{title}</p>
  ) : null

  return (
    <div className={notificationToastBodyStyles.wrap}>
      {/* Identity row: app name + timestamp */}
      <div className={notificationToastBodyStyles.identityRow}>
        <p className={appNameClass}>{appName}</p>
        <span className={notificationToastBodyStyles.now}>now</span>
      </div>

      {titleEl}

      <p className={notificationToastBodyStyles.message}>{message}</p>
    </div>
  )
}
