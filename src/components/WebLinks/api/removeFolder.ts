interface RemoveFolderResult {
  success: boolean
  error?: string
}

/**
 * Delete a folder by id. The backend unfiles the folder's previews and
 * sub-folders (sets their parent to null) rather than cascade-deleting them.
 */
export async function removeFolder(folderId: string): Promise<void> {
  const api = (window as never as {
    api: { previewerRemoveFolder: (folderId: string) => Promise<RemoveFolderResult> }
  }).api
  const result = await api.previewerRemoveFolder(folderId)
  if (!result.success) throw new Error(result.error || 'Failed to delete folder.')
}
