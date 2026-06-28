import { useNotesStore, type Note } from '@/store/notes-store'

/**
 * Look up a `Note` by id across **all** scopes in the in-memory store.
 *
 * The Notes app loads notes lazily per scope (`appId::contextId::id`),
 * so a note's exact scope might not be known to the caller — we just
 * scan every loaded scope. Returns `null` when no match is found.
 */
export function lookupNoteById(noteId: string): Note | null {
  const byScope = useNotesStore.getState().notesByScope
  for (const notes of Object.values(byScope)) {
    const match = notes.find((n) => n.id === noteId)
    if (match) return match
  }
  return null
}
