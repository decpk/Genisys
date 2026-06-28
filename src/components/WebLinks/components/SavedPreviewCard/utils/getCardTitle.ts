import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

/**
 * Resolve a human-friendly title for a saved preview, falling back to the
 * URL's hostname when the page provided no title.
 */
export function getCardTitle(preview: SavedPreview): string {
  if (preview.title) return preview.title

  const source = preview.finalUrl || preview.url
  try {
    return new URL(source).hostname
  } catch {
    return source
  }
}
