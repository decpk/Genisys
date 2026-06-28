import type { AppendDroppedFilesResult } from '../hooks/useLocalFilesData.types'

/**
 * Builds a short, user-facing toast message that summarizes the outcome of an
 * append-dropped-files operation. Returns null when there is nothing worth
 * surfacing to the user (e.g. all dropped items were duplicates and should be
 * silently ignored).
 */
export function summarizeAppendDroppedFilesResult(
  result: AppendDroppedFilesResult,
): { kind: 'success' | 'error' | 'info'; message: string } | null {
  const { added, skippedNonMarkdown, skippedDuplicate } = result

  if (added > 0) {
    const noun = added === 1 ? 'file' : 'files'
    if (skippedNonMarkdown > 0) {
      return {
        kind: 'success',
        message: `Added ${added} ${noun} (skipped ${skippedNonMarkdown} non-markdown)`,
      }
    }
    return { kind: 'success', message: `Added ${added} ${noun}` }
  }

  if (skippedNonMarkdown > 0) {
    return { kind: 'error', message: 'No markdown files in dropped items' }
  }

  if (skippedDuplicate > 0) {
    return { kind: 'info', message: 'Files are already added' }
  }

  return null
}
