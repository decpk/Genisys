import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { NoteProject } from '@/store/note-projects-store'

export interface NotebookProjectGroup {
  project: NoteProject
  notebooks: NoteNotebook[]
}

export interface GroupedNotebooks {
  unsorted: NoteNotebook[]
  groups: NotebookProjectGroup[]
}

export function groupNotebooksByProject(
  notebooks: NoteNotebook[],
  projects: NoteProject[],
): GroupedNotebooks {
  const unsorted: NoteNotebook[] = []
  const byProject = new Map<string, NoteNotebook[]>()
  for (const notebook of notebooks) {
    if (notebook.projectId == null) {
      unsorted.push(notebook)
      continue
    }
    const list = byProject.get(notebook.projectId)
    if (list) list.push(notebook)
    else byProject.set(notebook.projectId, [notebook])
  }
  const groups: NotebookProjectGroup[] = []
  for (const project of projects) {
    const list = byProject.get(project.id)
    if (list && list.length > 0) groups.push({ project, notebooks: list })
  }
  return { unsorted, groups }
}
