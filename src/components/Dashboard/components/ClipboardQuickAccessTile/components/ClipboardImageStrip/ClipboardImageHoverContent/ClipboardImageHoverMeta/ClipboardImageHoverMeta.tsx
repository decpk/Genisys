import { Clock } from 'lucide-react'

import { formatImageCapturedAt } from '../utils/formatImageCapturedAt'

import { clipboardImageHoverMetaStyles as styles } from './ClipboardImageHoverMeta.styles'
import type { ClipboardImageHoverMetaProps } from './ClipboardImageHoverMeta.types'

/**
 * Slim metadata strip rendered between the image and the tabs in the
 * clipboard image hover popover. Shows the absolute capture date+time
 * alongside the relative ("2m ago") label.
 */
export function ClipboardImageHoverMeta(
  props: ClipboardImageHoverMetaProps
): React.JSX.Element {
  const { createdAt } = props
  const { absolute, relative } = formatImageCapturedAt(createdAt)

  return (
    <div className={styles.root}>
      <Clock size={12} className={styles.icon} />
      <span className={styles.absolute}>{absolute}</span>
      <span className={styles.separator}>·</span>
      <span className={styles.relative}>{relative}</span>
    </div>
  )
}
