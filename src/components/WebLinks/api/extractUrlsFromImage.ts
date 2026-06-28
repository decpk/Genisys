interface ExtractUrlsResult {
  success: boolean
  urls?: string[]
  error?: string
}

/**
 * Extract candidate URLs from a screenshot via the backend vision command.
 *
 * `imageDataUrl` is a base64 data URL (e.g. `data:image/png;base64,…`). Pure
 * request/response wrapper — throws with the backend message on failure.
 */
export async function extractUrlsFromImage(imageDataUrl: string): Promise<string[]> {
  const api = (window as never as {
    api: { previewerExtractUrlsFromImage: (imageDataUrl: string) => Promise<ExtractUrlsResult> }
  }).api
  const result = await api.previewerExtractUrlsFromImage(imageDataUrl)
  if (result.success) return result.urls ?? []
  throw new Error(result.error || 'Failed to extract URLs from the image.')
}
