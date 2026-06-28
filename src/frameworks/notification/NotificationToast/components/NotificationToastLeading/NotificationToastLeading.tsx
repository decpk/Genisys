import { AppLoaderGlyph } from '@/components/AppLoader'
import { cn } from '@/lib/utils'

import { getNotificationTypeConfig } from '../../utils/getNotificationTypeConfig'
import { notificationToastLeadingStyles } from './NotificationToastLeading.styles'
import type { NotificationToastLeadingProps } from './NotificationToastLeading.types'

export function NotificationToastLeading(
  props: NotificationToastLeadingProps,
): React.JSX.Element {
  const { type, loading, icon, avatar } = props

  // Avatar takes precedence over the type glyph (iOS-style media attribution).
  if (avatar) {
    return <div className={notificationToastLeadingStyles.avatarBox}>{avatar}</div>
  }

  const { color, bg, Icon } = getNotificationTypeConfig(type)
  const IconComponent = icon ?? Icon
  const glyph = loading ? (
    <AppLoaderGlyph size={18} className={color} />
  ) : (
    <IconComponent size={18} className={color} />
  )

  return <div className={cn(notificationToastLeadingStyles.iconBox, bg)}>{glyph}</div>
}
