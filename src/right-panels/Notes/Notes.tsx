import { Plus, ArrowLeft, StickyNote } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { notesPanelStyles } from './Notes.styles'
import { useNotesPanelData } from './useNotesPanelData'
import { ScopeSelector } from './ScopeSelector'
import { NoteItem } from './NoteItem'
import { NoteEditor } from './NoteEditor'

export function NotesPanel(): React.JSX.Element {
  const {
    scopes,
    activeScope,
    sortedNotes,
    activeNote,
    handleScopeChange,
    handleAddNote,
    handleSelectNote,
    handleDeleteNote,
    handleTogglePin,
    handleUpdateNote,
    handleBack,
  } = useNotesPanelData()

  // Editor view — when a note is selected
  if (activeNote) {
    return (
      <div className={notesPanelStyles.container}>
        <div className={notesPanelStyles.backRow}>
          <Button variant="ghost" size="xs" onClick={handleBack} className={notesPanelStyles.backButton}>
            <ArrowLeft size={12} />
            <span>Back</span>
          </Button>
        </div>

        <NoteEditor
          note={activeNote}
          onUpdateNote={handleUpdateNote}
        />
      </div>
    )
  }

  // List view
  return (
    <div className={notesPanelStyles.container}>
      {/* Header */}
      <div className={notesPanelStyles.header}>
        <span className={notesPanelStyles.headerTitle}>Notes</span>
        <div className={notesPanelStyles.headerActions}>
          <IconButton variant="default" size="sm" onClick={handleAddNote} tooltip="New note" className={notesPanelStyles.addButton}>
            <Plus size={14} />
          </IconButton>
        </div>
      </div>

      {/* Scope selector */}
      {scopes.length > 1 && (
        <div className={notesPanelStyles.scopeRow}>
          <ScopeSelector
            scopes={scopes}
            activeScope={activeScope}
            onScopeChange={handleScopeChange}
          />
        </div>
      )}

      {/* Notes list */}
      {sortedNotes.length > 0 && (
        <div className={notesPanelStyles.listArea}>
          {sortedNotes.map((note, i) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={false}
              onSelect={handleSelectNote}
              onDelete={handleDeleteNote}
              onTogglePin={handleTogglePin}
              showSeparator={i > 0}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {sortedNotes.length === 0 && (
        <div className={notesPanelStyles.emptyState}>
          <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
            <StickyNote size={18} className="text-muted-foreground/20" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground/40">No notes yet</p>
          <Button
            variant="link"
            size="xs"
            onClick={handleAddNote}
            className="text-[10px] text-primary/60 hover:text-primary"
          >
            Create your first note
          </Button>
        </div>
      )}
    </div>
  )
}
