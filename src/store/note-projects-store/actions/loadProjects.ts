import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

const PERSONAL_PROJECT_ID = 'personal'

/**
 * Load all projects from the backend. Auto-seeds the system 'Personal'
 * project on first run when the backend returns an empty list.
 */
export async function loadProjectsAction(get: Get, set: Set): Promise<void> {
  if (get().isLoaded) return
  try {
    const projects = (await window.api.loadNoteProjects()) as NoteProject[]
    set({ projects, isLoaded: true })

    // Auto-create the Personal system project if no system project exists
    const hasSystem = projects.some((p: NoteProject) => p.isSystem)
    if (!hasSystem) {
      const now = new Date().toISOString()
      const personal: NoteProject = {
        id: PERSONAL_PROJECT_ID,
        name: 'Personal',
        color: '#6366f1',
        icon: 'FolderOpen',
        emoji: null,
        isSystem: true,
        isFavorite: false,
        sortOrder: 0,
        sortPreference: null,
        createdAt: now,
        updatedAt: now,
      }
      await window.api.saveNoteProject(personal)
      set({ projects: [personal, ...projects] })
    }
  } catch {
    set({ projects: [], isLoaded: true })
  }
}
