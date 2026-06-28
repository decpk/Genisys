import type { SavedPreview } from '../WebLinks.types'

interface SavePreviewResult {
  success: boolean
  error?: string
}

/**
 * Upsert a saved preview (insert-or-replace) via the backend. Used for create
 * and move/edit since the command is idempotent on `id`.
 */
export async function savePreview(preview: SavedPreview): Promise<void> {
  const api = (window as never as {
    api: { previewerSavePreview: (preview: SavedPreview) => Promise<SavePreviewResult> }
  }).api
  const result = await api.previewerSavePreview(preview)
  if (!result.success) throw new Error(result.error || 'Failed to save preview.')
}
