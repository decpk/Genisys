import { getAllNotes } from './getAllNotes'
import { normalizeNoteTitle } from './normalizeNoteTitle'

/** Resolve a title to an existing note id (case-insensitive), or `null`. */
export function resolveNoteIdByTitle(title: string): string | null {
  const norm = normalizeNoteTitle(title)
  if (!norm) return null
  const match = getAllNotes().find((n) => normalizeNoteTitle(n.title) === norm)
  return match?.id ?? null
}
