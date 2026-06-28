import type { ClipboardTextContentMode } from './ClipboardTextContent.types'

/**
 * Plain-text styling used when syntax highlighting is OFF or the item isn't
 * detected as code. Mirrors the original inline styles in `ClipboardItemCard`
 * (3-line clamp) and `ClipboardPreviewModal` (full scroll).
 */
export const PLAIN_TEXT_STYLES: Record<ClipboardTextContentMode, string> = {
  card: 'text-[13px] text-foreground/80 line-clamp-3 whitespace-pre-wrap break-all leading-relaxed',
  modal: 'text-sm text-foreground/90 whitespace-pre-wrap break-all leading-relaxed',
}

/** Wrapper styling for the modal plain-text branch (matches the original `TextPreview`). */
export const MODAL_PLAIN_WRAPPER_STYLES = 'p-4'
