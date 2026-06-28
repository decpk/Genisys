import { Progress } from '@/components/ui/progress'

import type { ExplorerCopyProgressToastProps } from './ExplorerCopyProgressToast.types'
import * as styles from './ExplorerCopyProgressToast.styles'
import { useExplorerCopyProgressToastData } from './useExplorerCopyProgressToastData'

function ExplorerCopyProgressToast(props: ExplorerCopyProgressToastProps) {
  const { title } = props
  const { percent, copiedLabel, totalLabel, filesDone, totalFiles, currentFile } =
    useExplorerCopyProgressToastData(props)

  const percentLabel = `${percent}%`
  const bytesLabel = `${copiedLabel} / ${totalLabel}`
  const filesLabel = `${filesDone}/${totalFiles} files`

  return (
    <div className={styles.CONTAINER}>
      <div className={styles.HEADER}>
        <span className={styles.TITLE}>{title}</span>
        <span className={styles.PERCENT}>{percentLabel}</span>
      </div>
      <div className={styles.BAR_ROW}>
        <Progress value={percent} />
      </div>
      <div className={styles.META_ROW}>
        <span>{bytesLabel}</span>
        <span>{filesLabel}</span>
      </div>
      <span className={styles.CURRENT_FILE}>{currentFile}</span>
    </div>
  )
}

export { ExplorerCopyProgressToast }
