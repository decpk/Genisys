import { UNTITLED_CONTAINER_FALLBACK, UNTITLED_NOTE_FALLBACK } from '../notes-export.constants'
import type { ExportSubject } from '../notes-export.types'

/**
 * Resolve the title that should appear on the exported document's cover
 * page (and which is used to compute the saved filename).
 *
 * - For a single note: the note's title (or `UNTITLED_NOTE_FALLBACK`).
 * - For a container: the container's name (or `UNTITLED_CONTAINER_FALLBACK`).
 */
export function resolveSubjectBookTitle(subject: ExportSubject): string {
  if (subject.kind === 'note') {
    const title = subject.note.title?.trim()
    return title && title.length > 0 ? title : UNTITLED_NOTE_FALLBACK
  }
  const name = subject.node.name?.trim()
  return name && name.length > 0 ? name : UNTITLED_CONTAINER_FALLBACK
}
