import type { PreviewFolder, SavedPreview } from '../WebLinks.types'

/** Raw envelope returned by the `cmd_previewer_load_all` Tauri command. */
interface LoadPreviewerDataResult {
  success: boolean
  folders?: PreviewFolder[]
  previews?: SavedPreview[]
  error?: string
}

/**
 * Load all previewer folders + saved previews from the backend.
 *
 * Pure request/response wrapper — unwraps the success envelope and throws on
 * failure so callers receive clean data or an Error.
 */
export async function loadWebLinksData(): Promise<{
  folders: PreviewFolder[]
  previews: SavedPreview[]
}> {
  const api = (window as never as {
    api: { previewerLoadAll: () => Promise<LoadPreviewerDataResult> }
  }).api
  const result = await api.previewerLoadAll()
  if (result.success) {
    return { folders: result.folders ?? [], previews: result.previews ?? [] }
  }
  throw new Error(result.error || 'Failed to load collections.')
}
