import { cn } from '@/lib/utils'

import { notesSplitDividerStyles } from './NotesSplitDivider.styles'
import type { NotesSplitDividerProps } from './NotesSplitDivider.types'
import { useNotesSplitDividerData } from './useNotesSplitDividerData'

export function NotesSplitDivider(props: NotesSplitDividerProps): React.JSX.Element {
  const { orientation } = props
  const { isDragging, onPointerDown, onPointerMove, onPointerUp, onDoubleClick } =
    useNotesSplitDividerData(props)

  const isSideBySide = orientation === 'side-by-side'
  const orientationClass = isSideBySide
    ? notesSplitDividerStyles.sideBySide
    : notesSplitDividerStyles.stacked
  const stateClass = isDragging ? notesSplitDividerStyles.dragging : notesSplitDividerStyles.idle
  const gripClass = isSideBySide
    ? notesSplitDividerStyles.gripSideBySide
    : notesSplitDividerStyles.gripStacked
  const ariaOrientation = isSideBySide ? 'vertical' : 'horizontal'

  const dividerClass = cn(notesSplitDividerStyles.base, orientationClass, stateClass)

  return (
    <div
      role="separator"
      aria-orientation={ariaOrientation}
      className={dividerClass}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <span className={gripClass} />
    </div>
  )
}
