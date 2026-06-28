const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/**
 * Resolve the CSS `font-family` for the xterm canvas from the global
 * "Code & Terminal → Terminal font family" setting.
 *
 * The setting stores either a full CSS font-family stack (chosen from
 * `MONOSPACE_FONT_OPTIONS`) or `null` for "System default". A monospace
 * fallback is always appended so non-mono picks still render with predictable
 * cell widths.
 */
export function resolveTerminalFontFamily(family: string | null): string {
  if (!family) return MONO_FALLBACK
  if (family.includes('monospace')) return family
  return `${family}, ${MONO_FALLBACK}`
}
