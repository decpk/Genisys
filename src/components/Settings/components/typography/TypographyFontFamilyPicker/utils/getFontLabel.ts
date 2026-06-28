import { MONOSPACE_FONT_OPTIONS } from '@/lib/fonts'

/**
 * Look up the human-readable label for a font-family CSS stack.
 * Falls back to "System default" when the value isn't in the catalogue.
 */
export function getFontLabel(value: string | null): string {
  const match = MONOSPACE_FONT_OPTIONS.find((opt) => opt.value === value)
  return match?.label ?? 'System default'
}
