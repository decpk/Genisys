import { cn } from '@/lib/utils'

import { notesMainContentStyles as styles } from '../../NotesMainContent.styles'
import { NotesExportMenu } from '../../../../notes-export'
import { NotesModeToggle } from './NotesModeToggle'
import { NotesLabelsToggle } from './NotesLabelsToggle'
import { NotesWidthPicker } from './NotesWidthPicker'
import type { NotesToolbarProps } from './NotesToolbar.types'
import { useNotesToolbarData } from './useNotesToolbarData'

export function NotesToolbar(props: NotesToolbarProps): React.JSX.Element {
  const {
    note,
    title,
    onTitleChange,
    isReadOnly,
    mode,
    onModeChange,
    contentWidth,
    onContentWidthChange,
    showLabels,
    labelCount,
    trailing,
  } = props

  const { toolbarRef, isCompact, handleToggleLabels } = useNotesToolbarData()

  const titleClass = cn(styles.toolbarTitle, isReadOnly && 'opacity-70 cursor-default')
  const exportVariant = isCompact ? 'icon' : 'button-with-label'

  return (
    <div ref={toolbarRef} className={styles.toolbar}>
      <input
        type="text"
        value={title}
        onChange={onTitleChange}
        placeholder="Untitled"
        readOnly={isReadOnly}
        className={titleClass}
      />

      <div className={styles.toolbarRight}>
        <NotesModeToggle mode={mode} onModeChange={onModeChange} isCompact={isCompact} />

        <div className={styles.toolbarDivider} />

        <NotesLabelsToggle
          showLabels={showLabels}
          labelCount={labelCount}
          isCompact={isCompact}
          onToggle={handleToggleLabels}
        />

        <div className={styles.toolbarDivider} />

        <NotesWidthPicker
          contentWidth={contentWidth}
          onContentWidthChange={onContentWidthChange}
          isCompact={isCompact}
        />

        <div className={styles.toolbarDivider} />

        <NotesExportMenu subject={{ kind: 'note', note }} variant={exportVariant} />

        <div className={styles.toolbarDivider} />

        {trailing}
      </div>
    </div>
  )
}
