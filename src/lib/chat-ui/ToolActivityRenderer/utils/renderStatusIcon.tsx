import { Check, AlertCircle, Circle } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { toolActivityRendererStyles as styles } from '../ToolActivityRenderer.styles'
import type { ToolActivity } from '../ToolActivityRenderer.types'

/** Render the leading status icon for an activity at a given size. */
export function renderStatusIcon(activity: ToolActivity, size: number): React.JSX.Element {
  if (activity.status === 'pending') {
    return <Circle size={size} className={styles.pendingIcon} />
  }
  if (activity.status === 'running') {
    return <AppLoaderGlyph size={size} className={styles.runningIcon} />
  }
  if (activity.status === 'error') {
    return <AlertCircle size={size} className={styles.errorIcon} />
  }
  if (activity.icon) {
    const Icon = activity.icon
    return <Icon size={size} className={styles.defaultIcon} />
  }
  return <Check size={size} className={styles.doneIcon} />
}
