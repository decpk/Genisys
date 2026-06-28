import { CheckCircle2 } from 'lucide-react'
import type { CrawledSourceChipProps } from './CrawledSourceChip.types'
import * as styles from './CrawledSourceChip.styles'

export function CrawledSourceChip(props: CrawledSourceChipProps): React.JSX.Element {
  const { domain, byteSize } = props
  return (
    <span className={styles.WRAPPER}>
      <CheckCircle2 size={12} className={styles.ICON} />
      <span className={styles.LABEL}>Fetched</span>
      <span className={styles.LABEL}>{domain}</span>
      <span className={styles.SEPARATOR}>·</span>
      <span className={styles.LABEL}>{byteSize}</span>
    </span>
  )
}
