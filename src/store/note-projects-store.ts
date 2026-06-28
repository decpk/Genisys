import { create } from 'zustand'
import { loadProjectsAction } from './note-projects-store/actions/loadProjects'
import { addProjectAction } from './note-projects-store/actions/addProject'
import { updateProjectAction } from './note-projects-store/actions/updateProject'
import { removeProjectAction } from './note-projects-store/actions/removeProject'
import { reorderProjectsAction } from './note-projects-store/actions/reorderProjects'
import { setProjectAppearanceAction } from './note-projects-store/actions/setProjectAppearance'
import { toggleProjectFavoriteAction } from './note-projects-store/actions/toggleProjectFavorite'
import { setProjectSortPreferenceAction } from './note-projects-store/actions/setProjectSortPreference'
import type { NotesSidebarSort } from './notes-app-store'

export interface NoteProject {
  id: string
  name: string
  color: string | null
  icon: string | null
  emoji: string | null
  isSystem: boolean
  isFavorite: boolean
  sortOrder: number
  sortPreference: NotesSidebarSort | null
  createdAt: string
  updatedAt: string
}

interface NoteProjectsState {
  projects: NoteProject[]
  isLoaded: boolean
}

interface NoteProjectsActions {
  loadProjects: () => Promise<void>
  addProject: (name: string, color?: string | null) => Promise<NoteProject>
  updateProject: (project: NoteProject) => Promise<void>
  removeProject: (id: string) => Promise<void>
  reorderProjects: (orderedIds: string[]) => Promise<void>
  setProjectAppearance: (
    id: string,
    appearance: { color?: string | null; emoji?: string | null },
  ) => Promise<void>
  toggleProjectFavorite: (id: string) => Promise<void>
  setProjectSortPreference: (id: string, sortPreference: NotesSidebarSort | null) => Promise<void>
}

export const useNoteProjectsStore = create<NoteProjectsState & NoteProjectsActions>()(
  (set, get) => ({
    projects: [],
    isLoaded: false,

    loadProjects: () => loadProjectsAction(get, set),
    addProject: (name, color) => addProjectAction(get, set, name, color),
    updateProject: (project) => updateProjectAction(get, set, project),
    removeProject: (id) => removeProjectAction(get, set, id),
    reorderProjects: (orderedIds) => reorderProjectsAction(get, set, orderedIds),
    setProjectAppearance: (id, appearance) => setProjectAppearanceAction(get, set, id, appearance),
    toggleProjectFavorite: (id) => toggleProjectFavoriteAction(get, set, id),
    setProjectSortPreference: (id, sortPreference) =>
      setProjectSortPreferenceAction(get, set, id, sortPreference),
  }),
)
