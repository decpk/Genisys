import { cn } from '@/lib/utils'

import {
  NOTES_DROP_ZONE_CLASS,
  NOTES_DROP_ZONE_LABEL,
  notesDropOverlayStyles as styles,
} from './NotesDropOverlay.styles'
import type { NotesDropOverlayProps } from './NotesEditorDropZones.types'

/** Visual-only overlay highlighting the drop zone while a note is dragged over. */
export function NotesDropOverlay(props: NotesDropOverlayProps): React.JSX.Element | null {
  const { isDragging, activeZone } = props

  if (!isDragging || !activeZone) return null

  const highlightClass = cn(styles.highlight, NOTES_DROP_ZONE_CLASS[activeZone])
  const label = NOTES_DROP_ZONE_LABEL[activeZone]

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} />
      <div className={highlightClass}>
        <span className={styles.hint}>{label}</span>
      </div>
    </div>
  )
}
