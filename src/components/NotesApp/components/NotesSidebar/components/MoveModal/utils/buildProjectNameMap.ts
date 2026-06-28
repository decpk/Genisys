import type { NoteProject } from '@/store/note-projects-store'

export function buildProjectNameMap(projects: NoteProject[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const project of projects) {
    map.set(project.id, project.name)
  }
  return map
}
