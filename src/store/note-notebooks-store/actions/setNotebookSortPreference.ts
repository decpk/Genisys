import type { NoteNotebook } from '../../note-notebooks-store'
import type { NotesSidebarSort } from '../../notes-app-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Set (or clear) a notebook's per-notebook sort preference. Pass `null`
 * to fall back to the parent project's preference (or the global sidebar
 * sort). Optimistically updates the in-memory list, then persists via the
 * bridge.
 */
export async function setNotebookSortPreferenceAction(
  get: Get,
  set: Set,
  id: string,
  sortPreference: NotesSidebarSort | null,
): Promise<void> {
  const state = get()
  const existing = state.notebooks.find((n: NoteNotebook) => n.id === id)
  if (!existing) return
  if (existing.sortPreference === sortPreference) return

  const updated: NoteNotebook = {
    ...existing,
    sortPreference,
    updatedAt: new Date().toISOString(),
  }

  set({
    notebooks: state.notebooks.map((n: NoteNotebook) =>
      n.id === id ? updated : n,
    ),
  })

  try {
    await window.api.saveNoteNotebook(updated)
  } catch (err) {
    console.error('[note-notebooks] setNotebookSortPreference failed', err)
  }
}
