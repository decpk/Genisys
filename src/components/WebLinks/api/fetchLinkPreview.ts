import type { LinkPreview } from '../WebLinks.types'

/** Raw envelope returned by the `cmd_fetch_link_preview` Tauri command. */
interface FetchLinkPreviewResult {
  success: boolean
  preview?: LinkPreview
  error?: string
}

/**
 * Fetch link-preview metadata for a URL via the Rust backend.
 *
 * Pure request/response wrapper — unwraps the success envelope and throws on
 * failure so callers receive clean `LinkPreview` data or an Error.
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const result = (await (window as never as { api: { fetchLinkPreview: (u: string) => Promise<FetchLinkPreviewResult> } }).api.fetchLinkPreview(url))
  if (result.success && result.preview) return result.preview
  throw new Error(result.error || 'Failed to fetch preview.')
}
