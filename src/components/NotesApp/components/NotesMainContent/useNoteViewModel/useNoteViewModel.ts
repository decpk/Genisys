import { useMemo } from 'react'

import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'
import type { Note } from '@/store/notes-store'

import type {
  NoteLabelSummary,
  NoteSourceInfo,
  NoteViewModel,
} from './useNoteViewModel.types'

/**
 * Resolves display data (breadcrumb, labels, source) for a single note so each
 * pane can render independently. Pure derivation from the organizational stores.
 */
export function useNoteViewModel(note: Note | null): NoteViewModel {
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)
  const sections = useNoteSectionsStore((s) => s.sections)
  const topics = useNoteTopicsStore((s) => s.topics)
  const labels = useNoteLabelsStore((s) => s.labels)

  const breadcrumb = useMemo(() => {
    if (!note) return []
    const parts: string[] = []
    const nb = notebooks.find((n) => n.id === note.notebookId)
    if (nb) parts.push(nb.name)
    const sec = sections.find((s) => s.id === note.sectionId)
    if (sec) parts.push(sec.name)
    const top = topics.find((t) => t.id === note.topicId)
    if (top) parts.push(top.name)
    return parts
  }, [note, notebooks, sections, topics])

  const noteLabels = useMemo<NoteLabelSummary[]>(() => {
    if (!note) return []
    return note.labels
      .map((id) => labels.find((l) => l.id === id))
      .filter(Boolean) as NoteLabelSummary[]
  }, [note, labels])

  const sourceInfo = useMemo<NoteSourceInfo | null>(() => {
    if (!note?.source) return null
    try {
      return JSON.parse(note.source) as NoteSourceInfo
    } catch {
      return null
    }
  }, [note])

  return { breadcrumb, noteLabels, allLabels: labels, sourceInfo }
}
