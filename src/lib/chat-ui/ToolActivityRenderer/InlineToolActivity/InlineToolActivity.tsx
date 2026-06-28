import { memo } from 'react'

import { toolActivityRendererStyles as styles } from '../ToolActivityRenderer.styles'
import { renderStatusIcon } from '../utils/renderStatusIcon'
import type { InlineToolActivityProps } from './InlineToolActivity.types'

/** Single one-line activity row used by `inline` mode. */
export const InlineToolActivity = memo(function InlineToolActivity(
  props: InlineToolActivityProps,
): React.JSX.Element {
  const { activity } = props
  const label = activity.label ?? activity.toolName

  return (
    <div className={styles.inlineItem}>
      {renderStatusIcon(activity, 10)}
      <span className={styles.inlineLabel}>{label}</span>
    </div>
  )
})
