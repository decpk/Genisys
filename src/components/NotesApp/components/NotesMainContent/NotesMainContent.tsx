import { NotebookPen } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { notesMainContentStyles as styles } from './NotesMainContent.styles'
import { useNotesMainContentData } from './useNotesMainContentData'
import { NotesSplitView } from './components/NotesSplitView'
import { NotesMainContentSingle } from './components/NotesMainContentSingle'

export function NotesMainContent(): React.JSX.Element {
  const { selectedNote, renderSplit, handleAddPage } = useNotesMainContentData()

  if (renderSplit) {
    return <NotesSplitView />
  }

  if (!selectedNote) {
    return (
      <div className={styles.emptyState}>
        <NotebookPen size={56} strokeWidth={1} className={styles.emptyIcon} />
        <p className={styles.emptyText}>Select or create a page to start writing</p>
        <Button onClick={handleAddPage} className={styles.emptyButton}>
          New Page
        </Button>
      </div>
    )
  }

  return <NotesMainContentSingle key={selectedNote.id} note={selectedNote} />
}

export { SaveStatusIndicator } from './SaveStatusIndicator'
