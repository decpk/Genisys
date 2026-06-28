import type { NoteNotebook } from '../../note-notebooks-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Move a notebook into a different project (or detach it by passing `null`).
 * Optimistically updates the in-memory list, then persists via the bridge.
 */
export async function moveNotebookAction(
  get: Get,
  set: Set,
  notebookId: string,
  newProjectId: string | null,
): Promise<void> {
  const state = get()
  const existing = state.notebooks.find((n: NoteNotebook) => n.id === notebookId)
  if (!existing) return
  if (existing.projectId === newProjectId) return

  const updated: NoteNotebook = {
    ...existing,
    projectId: newProjectId,
    updatedAt: new Date().toISOString(),
  }

  set({
    notebooks: state.notebooks.map((n: NoteNotebook) => (n.id === notebookId ? updated : n)),
  })

  try {
    await window.api.moveNoteNotebook(notebookId, newProjectId)
  } catch (err) {
    console.error('[note-notebooks] moveNotebook failed', err)
  }
}
