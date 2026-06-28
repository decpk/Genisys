import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Create a new (user) project and persist it to the backend.
 * Returns the created project so callers can navigate to it.
 */
export async function addProjectAction(
  get: Get,
  set: Set,
  name: string,
  color?: string | null,
): Promise<NoteProject> {
  const state = get()
  const now = new Date().toISOString()
  const project: NoteProject = {
    id: crypto.randomUUID(),
    name,
    color: color ?? null,
    icon: null,
    emoji: null,
    isSystem: false,
    isFavorite: false,
    sortOrder: state.projects.length,
    sortPreference: null,
    createdAt: now,
    updatedAt: now,
  }

  set({ projects: [...state.projects, project] })

  try {
    await window.api.saveNoteProject(project)
  } catch (err) {
    console.error('[note-projects] addProject failed', err)
  }

  return project
}
