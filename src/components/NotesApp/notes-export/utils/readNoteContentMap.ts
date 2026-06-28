import { useNotesStore } from '@/store/notes-store'

/**
 * Snapshot the in-memory notes store into a lookup map of
 * `noteId → markdown content`.
 *
 * The Notes app loads every note for the global scope on boot, so the
 * store is the authoritative source. Reading from it directly via
 * `useNotesStore.getState()` (rather than as a hook) keeps this util
 * a plain synchronous function — testable and reusable from non-React
 * callers.
 */
export function readNoteContentMap(): Map<string, string> {
  const byScope = useNotesStore.getState().notesByScope
  const lookup = new Map<string, string>()
  for (const notes of Object.values(byScope)) {
    for (const note of notes) {
      lookup.set(note.id, note.content)
    }
  }
  return lookup
}
