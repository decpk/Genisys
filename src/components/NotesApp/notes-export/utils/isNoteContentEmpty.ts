/**
 * Returns true when a note's markdown content is effectively empty.
 * Used by the export pipeline to skip notes that would otherwise
 * produce blank chapters in the exported document.
 */
export function isNoteContentEmpty(content: string | null | undefined): boolean {
  if (!content) return true
  return content.trim().length === 0
}
