/**
 * Loads a clipboard image (thumbnail or full-resolution) from disk and
 * returns it as a base64 data URL. Throws if the underlying IPC call
 * fails so callers can render an error state.
 *
 * Used by both `ClipboardImageThumb` (thumbnail bytes) and
 * `ClipboardImageHoverContent` (full-resolution preview).
 */
export async function fetchClipboardImageDataUrl(imagePath: string): Promise<string> {
  const result = await window.api.getClipboardImage(imagePath)
  if (result.success && result.dataUrl) return result.dataUrl
  throw new Error(result.error ?? 'Failed to load clipboard image.')
}
