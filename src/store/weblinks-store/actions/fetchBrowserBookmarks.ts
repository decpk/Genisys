import type {
  BrowserBookmark,
  BrowserKind,
} from '@/components/WebLinks/WebLinks.types'
import { importBrowserBookmarks } from '@/components/WebLinks/api/importBrowserBookmarks'

/** Read + parse bookmarks from a specific browser source (passthrough). */
export async function fetchBrowserBookmarksAction(
  browser: BrowserKind,
  profilePath: string,
): Promise<BrowserBookmark[]> {
  return importBrowserBookmarks(browser, profilePath)
}
