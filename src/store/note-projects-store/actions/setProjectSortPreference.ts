import type { NoteProject } from '../../note-projects-store'
import type { NotesSidebarSort } from '../../notes-app-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Set (or clear) a project's per-project sort preference. Pass `null` to
 * fall back to the global sidebar sort. Optimistically updates the
 * in-memory list, then persists via the bridge.
 */
export async function setProjectSortPreferenceAction(
  get: Get,
  set: Set,
  id: string,
  sortPreference: NotesSidebarSort | null,
): Promise<void> {
  const state = get()
  const existing = state.projects.find((p: NoteProject) => p.id === id)
  if (!existing) return
  if (existing.sortPreference === sortPreference) return

  const updated: NoteProject = {
    ...existing,
    sortPreference,
    updatedAt: new Date().toISOString(),
  }

  set({
    projects: state.projects.map((p: NoteProject) =>
      p.id === id ? updated : p,
    ),
  })

  try {
    await window.api.saveNoteProject(updated)
  } catch (err) {
    console.error('[note-projects] setProjectSortPreference failed', err)
  }
}
