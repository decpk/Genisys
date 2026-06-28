interface RemovePreviewResult {
  success: boolean
  error?: string
}

/** Delete a saved preview by id. */
export async function removePreview(previewId: string): Promise<void> {
  const api = (window as never as {
    api: { previewerRemovePreview: (previewId: string) => Promise<RemovePreviewResult> }
  }).api
  const result = await api.previewerRemovePreview(previewId)
  if (!result.success) throw new Error(result.error || 'Failed to delete preview.')
}
