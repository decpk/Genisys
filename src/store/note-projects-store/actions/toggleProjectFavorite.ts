import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

export async function toggleProjectFavoriteAction(
  get: Get,
  set: Set,
  id: string,
): Promise<void> {
  const state = get()
  const existing = state.projects.find((p: NoteProject) => p.id === id)
  if (!existing) return

  const updated: NoteProject = {
    ...existing,
    isFavorite: !existing.isFavorite,
    updatedAt: new Date().toISOString(),
  }

  set({
    projects: state.projects.map((p: NoteProject) => (p.id === id ? updated : p)),
  })

  try {
    await window.api.saveNoteProject(updated)
  } catch (err) {
    console.error('[note-projects] toggleProjectFavorite failed', err)
  }
}
