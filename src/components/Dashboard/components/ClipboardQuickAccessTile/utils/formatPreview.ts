import { PREVIEW_MAX_LENGTH } from '../ClipboardQuickAccessTile.constants'

/**
 * Compact one-line preview: collapses whitespace/newlines and truncates
 * to `PREVIEW_MAX_LENGTH` characters with an ellipsis.
 */
export function formatPreview(text: string | null): string {
  if (!text) return ''
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= PREVIEW_MAX_LENGTH) return flat
  return `${flat.slice(0, PREVIEW_MAX_LENGTH)}…`
}
