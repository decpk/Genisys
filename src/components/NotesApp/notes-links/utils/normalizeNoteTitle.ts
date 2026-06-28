/** Normalize a note title for case-insensitive, trim-insensitive matching. */
export function normalizeNoteTitle(title: string): string {
  return title.trim().toLowerCase()
}
