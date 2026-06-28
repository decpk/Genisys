interface ClearAllResult {
  success: boolean
  error?: string
}

/** Delete every saved preview and every folder from the backend. */
export async function clearAllWebLinks(): Promise<void> {
  const api = (window as never as {
    api: { previewerClearAll: () => Promise<ClearAllResult> }
  }).api
  const result = await api.previewerClearAll()
  if (!result.success) throw new Error(result.error || 'Failed to clear web links.')
}
