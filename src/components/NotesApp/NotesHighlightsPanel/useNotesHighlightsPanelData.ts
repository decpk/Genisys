import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNotesToc } from '@/components/NotesApp/NotesTocProvider'
import { scrollEditorToPos } from '@/components/NotesApp/NotesTocProvider/utils/scrollEditorToPos'
import type { NoteHighlight } from '@/store/note-highlights-store'
import { useNoteHighlightsStore } from '@/store/note-highlights-store'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useNotesStore } from '@/store/notes-store'

import { resolveHighlightPos } from './utils/resolveHighlightPos'
import type { NotesHighlightsPanelData } from './NotesHighlightsPanel.types'

const EMPTY_HIGHLIGHTS: NoteHighlight[] = []
const NOTES_SCOPE_KEY = 'notes-app::global::all'

export function useNotesHighlightsPanelData(): NotesHighlightsPanelData {
  const selectedNoteId = useNotesAppStore((s) => s.selectedNoteId)

  const highlights = useNoteHighlightsStore((s) =>
    selectedNoteId ? s.highlightsByNote[selectedNoteId] ?? EMPTY_HIGHLIGHTS : EMPTY_HIGHLIGHTS,
  )
  const loadHighlights = useNoteHighlightsStore((s) => s.loadHighlights)
  const removeHighlight = useNoteHighlightsStore((s) => s.removeHighlight)

  const notes = useNotesStore((s) => s.notesByScope[NOTES_SCOPE_KEY])

  const { editor, scrollContainerRef } = useNotesToc()

  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedNoteId) {
      void loadHighlights(selectedNoteId)
    }
  }, [selectedNoteId, loadHighlights])

  const noteTitle = useMemo(() => {
    if (!selectedNoteId || !notes) return ''
    const match = notes.find((n) => n.id === selectedNoteId)
    return match?.title ?? ''
  }, [notes, selectedNoteId])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const onNavigate = useCallback(
    (highlight: NoteHighlight) => {
      if (!editor) return
      const pos = resolveHighlightPos(editor, highlight)
      if (!pos) return

      editor.chain().setTextSelection(pos).run()

      requestAnimationFrame(() => {
        const container = scrollContainerRef.current
        if (container) scrollEditorToPos(editor, pos.from, container)
      })
    },
    [editor, scrollContainerRef],
  )

  const onRemove = useCallback(
    (highlight: NoteHighlight) => {
      if (selectedNoteId) void removeHighlight(highlight.id, selectedNoteId)
    },
    [removeHighlight, selectedNoteId],
  )

  return { highlights, noteTitle, expandedId, toggleExpanded, onNavigate, onRemove }
}
