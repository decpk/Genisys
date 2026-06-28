import { NotesPane } from '../NotesPane'
import { NotesFullscreenButton, NotesSplitButton } from '../NotesToolbar'
import type { NotesMainContentSingleProps } from './NotesMainContentSingle.types'
import { useNotesMainContentSingleData } from './useNotesMainContentSingleData'

/** Single-note view: one pane wired to the global Notes settings. */
export function NotesMainContentSingle(props: NotesMainContentSingleProps): React.JSX.Element {
  const { note } = props

  const {
    notesMode,
    setNotesMode,
    toggleNotesMode,
    contentWidth,
    setContentWidth,
    showLabels,
    distractionFree,
    toggleDistractionFree,
    handleUpdateNote,
    handlePickSplitNote,
    handleDropNote,
  } = useNotesMainContentSingleData()

  const trailing = (
    <>
      <NotesSplitButton currentNoteId={note.id} onPick={handlePickSplitNote} isCompact={false} />
      <NotesFullscreenButton distractionFree={distractionFree} toggleDistractionFree={toggleDistractionFree} />
    </>
  )

  return (
    <NotesPane
      note={note}
      isActive
      mode={notesMode}
      contentWidth={contentWidth}
      showLabels={showLabels}
      onUpdateNote={handleUpdateNote}
      onModeChange={setNotesMode}
      onContentWidthChange={setContentWidth}
      onToggleMode={toggleNotesMode}
      trailing={trailing}
      dropMode="split"
      onDropNote={handleDropNote}
    />
  )
}
