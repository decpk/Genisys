import type { BrowserBookmarkSource } from '@/components/WebLinks/WebLinks.types'

import type { BookmarkImportView } from '../BookmarkImportDialog.types'

/** State inputs needed to derive the dialog's current view. */
export interface BookmarkImportViewInputs {
  /** Whether browser sources are currently being detected. */
  loadingSources: boolean
  /** Error from detecting sources, or null. */
  sourcesError: string | null
  /** The source the user picked, or null before a pick. */
  selectedSource: BrowserBookmarkSource | null
  /** Whether the selected source's bookmarks are being read. */
  loadingBookmarks: boolean
  /** Error from reading the selected source's bookmarks, or null. */
  error: string | null
  /** Number of detected sources. */
  sourceCount: number
  /** Number of imported bookmarks after success, or null. */
  importedCount: number | null
}

/**
 * Derive the single active view for the import dialog via ordered early-returns
 * (no chained ternaries), per the project's rendering conventions.
 */
export function computeBookmarkImportView(
  input: BookmarkImportViewInputs,
): BookmarkImportView {
  const {
    loadingSources,
    sourcesError,
    selectedSource,
    loadingBookmarks,
    error,
    sourceCount,
    importedCount,
  } = input

  if (importedCount !== null) return 'done'
  if (loadingSources) return 'loading-sources'
  if (sourcesError) return 'sources-error'

  if (selectedSource) {
    if (loadingBookmarks) return 'loading-bookmarks'
    if (error) return 'bookmarks-error'
    return 'confirm'
  }

  if (sourceCount === 0) return 'no-sources'
  return 'pick-source'
}
