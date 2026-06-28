import type { BrowserBookmarkSource } from '../WebLinks.types'

interface ListSourcesResult {
  success: boolean
  sources?: BrowserBookmarkSource[]
  error?: string
}

/**
 * Detect installed browsers + profiles whose bookmarks can be imported.
 * Pure request/response wrapper around the Tauri command.
 */
export async function listBookmarkSources(): Promise<BrowserBookmarkSource[]> {
  const api = (window as never as {
    api: { listBrowserBookmarkSources: () => Promise<ListSourcesResult> }
  }).api
  const result = await api.listBrowserBookmarkSources()
  if (result.success) return result.sources ?? []
  throw new Error(result.error || 'Failed to detect browser bookmarks.')
}
