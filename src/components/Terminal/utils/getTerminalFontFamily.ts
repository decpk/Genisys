import { FONT_CONFIG } from '@/lib/fonts'
import type { ReadingFont } from '@/store/settings-store'

/**
 * Resolve the CSS `font-family` value for the xterm canvas.
 *
 * Always appends a monospace fallback so non-mono picks (e.g. Inter, Poppins)
 * still render with predictable cell widths.
 */
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

export function getTerminalFontFamily(font: ReadingFont): string {
  const family = FONT_CONFIG[font]?.family
  if (!family) return MONO_FALLBACK
  return `${family}, ${MONO_FALLBACK}`
}
