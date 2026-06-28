const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_COLOR = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)/i
const HSL_COLOR = /hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d.]+\s*)?\)/i
const HEX_INLINE = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi

export function detectColor(text: string): boolean {
  const trimmed = text.trim()
  if (HEX_COLOR.test(trimmed)) return true
  if (RGB_COLOR.test(trimmed)) return true
  if (HSL_COLOR.test(trimmed)) return true
  const inlineMatches = trimmed.match(HEX_INLINE)
  if (inlineMatches && inlineMatches.length >= 1 && trimmed.length < 100) return true
  return false
}
