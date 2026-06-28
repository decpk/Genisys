import type { SavedPreview } from '../WebLinks.types'

interface SavePreviewsResult {
  success: boolean
  error?: string
}

/**
 * Bulk-upsert saved previews in a single backend call. Used when importing
 * many bookmarks at once to avoid one round-trip per item.
 */
export async function savePreviews(previews: SavedPreview[]): Promise<void> {
  const api = (window as never as {
    api: { previewerSavePreviews: (previews: SavedPreview[]) => Promise<SavePreviewsResult> }
  }).api
  const result = await api.previewerSavePreviews(previews)
  if (!result.success) throw new Error(result.error || 'Failed to save previews.')
}
