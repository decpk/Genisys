import { cn } from '@/lib/utils'

import { notesMainContentStyles as styles } from '../../NotesMainContent.styles'
import { NotesAutoScrollToolbar } from '../../NotesAutoScrollToolbar'
import { NotesToolbar } from '../NotesToolbar'
import { NotesEditorView } from '../NotesEditorView'
import { NotesPaneActiveEffects } from '../NotesPaneActiveEffects'
import { NotesDropOverlay, useNotesDropZones } from '../NotesEditorDropZones'
import type { NotesPaneProps } from './NotesPane.types'
import { useNotesPaneData } from './useNotesPaneData'

const NOOP_DROP = () => {}

export function NotesPane(props: NotesPaneProps): React.JSX.Element {
  const {
    note,
    isActive,
    mode,
    contentWidth,
    showLabels,
    onModeChange,
    onContentWidthChange,
    onToggleMode,
    onFocus,
    trailing,
    dropMode,
    onDropNote,
  } = props

  const {
    isReadOnly,
    title,
    handleTitleChange,
    handleContentChange,
    saveStatus,
    viewModel,
    handleToggleLabel,
  } = useNotesPaneData(props)

  const { isDragging, activeZone, dropProps } = useNotesDropZones({
    enabled: !!onDropNote,
    mode: dropMode ?? 'split',
    onDropNote: onDropNote ?? NOOP_DROP,
  })

  const inSplit = !!onFocus
  const containerClass = cn(
    styles.container,
    inSplit && 'relative',
    inSplit && isActive && 'ring-1 ring-inset ring-primary/30',
  )
  const contentWrapperClass = cn(styles.contentWrapper, 'relative')

  return (
    <div className={containerClass} onMouseDownCapture={onFocus}>
      <NotesToolbar
        note={note}
        title={title}
        onTitleChange={handleTitleChange}
        isReadOnly={isReadOnly}
        mode={mode}
        onModeChange={onModeChange}
        contentWidth={contentWidth}
        onContentWidthChange={onContentWidthChange}
        showLabels={showLabels}
        labelCount={viewModel.noteLabels.length}
        trailing={trailing}
      />

      <div className={contentWrapperClass} {...dropProps}>
        <NotesEditorView
          note={note}
          noteLabels={viewModel.noteLabels}
          allLabels={viewModel.allLabels}
          sourceInfo={viewModel.sourceInfo}
          onContentChange={handleContentChange}
          onToggleLabel={handleToggleLabel}
          showLabels={showLabels}
          contentWidth={contentWidth}
          isReadOnly={isReadOnly}
          isTocSource={isActive}
          isInSplit={inSplit}
        />
        <NotesDropOverlay isDragging={isDragging} activeZone={activeZone} mode={dropMode ?? 'split'} />
      </div>

      {isActive && <NotesAutoScrollToolbar isReadOnly={isReadOnly} saveStatus={saveStatus} />}

      {isActive && (
        <NotesPaneActiveEffects noteId={note.id} isReadOnly={isReadOnly} onToggleMode={onToggleMode} />
      )}
    </div>
  )
}
