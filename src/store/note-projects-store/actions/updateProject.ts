import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

/**
 * Update a project (name + appearance + favorite). System projects cannot
 * be renamed — the rename is silently dropped for those.
 */
export async function updateProjectAction(
  get: Get,
  set: Set,
  project: NoteProject,
): Promise<void> {
  const state = get()
  const existing = state.projects.find((p: NoteProject) => p.id === project.id)
  if (!existing) return

  let nextName = project.name
  if (existing.isSystem && existing.name !== project.name) {
    nextName = existing.name
  }

  const updated: NoteProject = {
    ...project,
    name: nextName,
    updatedAt: new Date().toISOString(),
  }

  set({
    projects: state.projects.map((p: NoteProject) => (p.id === updated.id ? updated : p)),
  })

  try {
    await window.api.saveNoteProject(updated)
  } catch (err) {
    console.error('[note-projects] updateProject failed', err)
  }
}
