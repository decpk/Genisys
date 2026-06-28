import type { PreviewFolder } from '../WebLinks.types'

interface SaveFolderResult {
  success: boolean
  error?: string
}

/**
 * Upsert a folder (insert-or-replace) via the backend. Used for create,
 * rename, recolor, and reorder since the command is idempotent on `id`.
 */
export async function saveFolder(folder: PreviewFolder): Promise<void> {
  const api = (window as never as {
    api: { previewerSaveFolder: (folder: PreviewFolder) => Promise<SaveFolderResult> }
  }).api
  const result = await api.previewerSaveFolder(folder)
  if (!result.success) throw new Error(result.error || 'Failed to save folder.')
}
