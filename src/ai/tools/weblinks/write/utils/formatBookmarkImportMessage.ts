import type { BookmarkImportResult } from '@/components/WebLinks/WebLinks.types'

/**
 * Build the AI tool's success message for a bookmark import, appending a
 * skipped-duplicates note when one or more bookmarks already existed.
 */
export function formatBookmarkImportMessage(
  result: BookmarkImportResult,
  sourceLabel: string,
): string {
  const { imported, duplicates } = result
  const importedNoun = imported === 1 ? 'bookmark' : 'bookmarks'
  let message = `✅ Imported ${imported} ${importedNoun} from ${sourceLabel}`

  if (duplicates > 0) {
    const duplicateNoun = duplicates === 1 ? 'duplicate' : 'duplicates'
    message += ` (${duplicates} ${duplicateNoun} skipped)`
  }

  return `${message}.`
}
