import type { NoteNotebook } from '@/store/note-notebooks-store'

export function getNotebookProjectSuffix(
  notebook: NoteNotebook,
  projectNameById: Map<string, string>,
): string | null {
  if (notebook.projectId == null) return null
  const name = projectNameById.get(notebook.projectId)
  if (!name) return null
  return `· ${name}`
}
