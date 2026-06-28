import type { NoteProject } from '../../note-projects-store'

type Get = () => any
type Set = (partial: any) => void

export async function reorderProjectsAction(
  get: Get,
  set: Set,
  orderedIds: string[],
): Promise<void> {
  const state = get()
  const map = new Map<string, NoteProject>(
    state.projects.map((p: NoteProject) => [p.id, p]),
  )
  const reordered = orderedIds
    .map((id, i) => {
      const p = map.get(id)
      return p ? { ...p, sortOrder: i } : null
    })
    .filter(Boolean) as NoteProject[]

  set({ projects: reordered })

  try {
    await window.api.reorderNoteProjects(orderedIds)
  } catch (err) {
    console.error('[note-projects] reorderProjects failed', err)
  }
}
