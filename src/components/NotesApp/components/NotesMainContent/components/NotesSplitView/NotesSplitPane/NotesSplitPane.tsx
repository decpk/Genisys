import { NotesPane } from '../../NotesPane'
import { NotesSplitControls } from '../../NotesToolbar'
import type { NotesSplitPaneProps } from './NotesSplitPane.types'

/** One sized pane within a split: a NotesPane plus its split toolbar controls. */
export function NotesSplitPane(props: NotesSplitPaneProps): React.JSX.Element {
  const {
    note,
    isActive,
    mode,
    contentWidth,
    showLabels,
    orientation,
    style,
    onUpdateNote,
    onModeChange,
    onContentWidthChange,
    onToggleMode,
    onFocus,
    onToggleOrientation,
    onSwap,
    onClose,
    onDropNote,
  } = props

  const trailing = (
    <NotesSplitControls
      orientation={orientation}
      onToggleOrientation={onToggleOrientation}
      onSwap={onSwap}
      onClose={onClose}
    />
  )

  return (
    <div style={style} className="min-w-0 min-h-0 overflow-hidden">
      <NotesPane
        note={note}
        isActive={isActive}
        mode={mode}
        contentWidth={contentWidth}
        showLabels={showLabels}
        onUpdateNote={onUpdateNote}
        onModeChange={onModeChange}
        onContentWidthChange={onContentWidthChange}
        onToggleMode={onToggleMode}
        onFocus={onFocus}
        trailing={trailing}
        dropMode="replace"
        onDropNote={(_zone, noteId) => onDropNote(noteId)}
      />
    </div>
  )
}
