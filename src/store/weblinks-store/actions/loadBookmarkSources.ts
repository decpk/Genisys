import type { BrowserBookmarkSource } from '@/components/WebLinks/WebLinks.types'
import { listBookmarkSources } from '@/components/WebLinks/api/listBookmarkSources'

/**
 * Detect installed browsers + profiles whose bookmarks can be imported.
 * Pure passthrough to the backend — holds no store state (the import dialog
 * keeps the transient source list locally).
 */
export async function loadBookmarkSourcesAction(): Promise<BrowserBookmarkSource[]> {
  return listBookmarkSources()
}
