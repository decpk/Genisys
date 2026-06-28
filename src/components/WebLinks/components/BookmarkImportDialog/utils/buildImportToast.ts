import type { BookmarkImportResult } from '@/components/WebLinks/WebLinks.types'

import type { ImportToastDescriptor } from '../BookmarkImportDialog.types'

/**
 * Derive the post-import toast: a success toast when nothing was skipped, or a
 * warning toast (with a duplicate-count description) when one or more bookmarks
 * already existed. Pure + side-effect-free so the dialog hook stays thin.
 */
export function buildImportToast(result: BookmarkImportResult): ImportToastDescriptor {
  const { imported, duplicates } = result
  const importedNoun = imported === 1 ? 'bookmark' : 'bookmarks'
  const message = `Imported ${imported} ${importedNoun}`

  if (duplicates > 0) {
    const duplicateNoun = duplicates === 1 ? 'duplicate' : 'duplicates'
    return {
      type: 'warning',
      message,
      description: `${duplicates} ${duplicateNoun} skipped`,
      duration: 4000,
    }
  }

  return { type: 'success', message, duration: 2000 }
}
