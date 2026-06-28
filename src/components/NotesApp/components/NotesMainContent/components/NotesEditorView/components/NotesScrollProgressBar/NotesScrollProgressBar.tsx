import { notesScrollProgressBarStyles as styles } from './NotesScrollProgressBar.styles'
import type { NotesScrollProgressBarProps } from './NotesScrollProgressBar.types'

export function NotesScrollProgressBar(props: NotesScrollProgressBarProps): React.JSX.Element | null {
  const { fillRef, labelRef, showBar, showLabel } = props

  if (!showBar && !showLabel) return null

  return (
    <div className={showBar ? styles.track : styles.trackBare}>
      {showBar && <div ref={fillRef} className={styles.fill} style={{ width: '0%' }} />}
      {showLabel && (
        <div ref={labelRef} className={styles.label} style={{ left: 0 }}>
          0%
        </div>
      )}
    </div>
  )
}
