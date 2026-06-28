import type { BrowserBookmark, BrowserKind } from '../WebLinks.types'

interface ImportBookmarksResult {
  success: boolean
  bookmarks?: BrowserBookmark[]
  error?: string
}

/**
 * Read + parse bookmarks from a specific browser profile via the backend.
 * Pure request/response wrapper — throws with the backend message on failure
 * (e.g. Safari requires macOS Full Disk Access).
 */
export async function importBrowserBookmarks(
  browser: BrowserKind,
  profilePath: string,
): Promise<BrowserBookmark[]> {
  const api = (window as never as {
    api: {
      importBrowserBookmarks: (
        browser: string,
        profilePath: string,
      ) => Promise<ImportBookmarksResult>
    }
  }).api
  const result = await api.importBrowserBookmarks(browser, profilePath)
  if (result.success) return result.bookmarks ?? []
  throw new Error(result.error || 'Failed to read bookmarks.')
}
