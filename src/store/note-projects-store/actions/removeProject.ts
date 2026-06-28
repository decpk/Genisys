import type { NoteProject } from '../../note-projects-store'
import type { NoteNotebook } from '../../note-notebooks-store'
import { useNoteNotebooksStore } from '../../note-notebooks-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Hard-delete a project and ALL of its notebooks (and their sections, topics,
 * notes — handled by FK cascade on the backend).
 *
 * System projects are protected client-side as well as server-side.
 */
export async function removeProjectAction(
  get: Get,
  set: Set,
  id: string,
): Promise<void> {
  const state = get()
  const project = state.projects.find((p: NoteProject) => p.id === id)
  if (!project || project.isSystem) return

  // Optimistically remove from in-memory project list.
  set({
    projects: state.projects.filter((p: NoteProject) => p.id !== id),
  })

  // Also drop in-memory notebooks that belonged to this project — the
  // backend cascade will delete the rows for us.
  useNoteNotebooksStore.setState((nb) => ({
    notebooks: nb.notebooks.filter((n: NoteNotebook) => n.projectId !== id),
  }))

  try {
    await window.api.removeNoteProject(id)
  } catch (err) {
    console.error('[note-projects] removeProject failed', err)
  }
}
