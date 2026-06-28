import type { Note } from '@/store/notes-store'

interface NotebookRef {
  id: string
  projectId?: string | null
}

/**
 * Computes the sidebar tree `nodeId`s that must be expanded for a given note's
 * row to be visible (its project, notebook, section and topic ancestors).
 * Unsorted notes (no notebook) resolve to the synthetic `'unsorted'` group.
 */
export function computeNoteAncestorNodeIds(note: Note, notebooks: NotebookRef[]): string[] {
  if (note.notebookId === null) {
    return ['unsorted']
  }

  const nodeIds: string[] = []
  const notebook = notebooks.find((nb) => nb.id === note.notebookId)
  if (notebook?.projectId) nodeIds.push(`prj::${notebook.projectId}`)
  nodeIds.push(`nb::${note.notebookId}`)
  if (note.sectionId) nodeIds.push(`sec::${note.sectionId}`)
  if (note.topicId) nodeIds.push(`topic::${note.topicId}`)

  return nodeIds
}
