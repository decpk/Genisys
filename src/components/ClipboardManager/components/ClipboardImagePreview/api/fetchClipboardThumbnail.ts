import { thumbnailCache } from '../utils/thumbnailCache'

/**
 * Loads a clipboard thumbnail from disk as a base64 data URL, backed by a
 * module-level cache so a scrolled-back card resolves instantly without a
 * second backend round-trip. Throws on failure so callers can render an
 * error state.
 */
export async function fetchClipboardThumbnail(thumbnailPath: string): Promise<string> {
  const cached = thumbnailCache.get(thumbnailPath)
  if (cached) return cached

  const result = await window.api.getClipboardImage(thumbnailPath)
  if (result.success && result.dataUrl) {
    thumbnailCache.set(thumbnailPath, result.dataUrl)
    return result.dataUrl
  }
  throw new Error(result.error ?? 'Failed to load clipboard thumbnail.')
}
