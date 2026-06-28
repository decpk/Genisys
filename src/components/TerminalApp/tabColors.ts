/**
 * Pick a readable (`#000` / `#fff`) text colour for a solid background colour
 * using perceptual luminance, so a coloured tab's label stays legible on any
 * preset.
 */
export function readableTextColor(hex: string): string {
  const c = hex.replace('#', '').trim()
  const full =
    c.length === 3
      ? c
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : c
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#ffffff'
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#000000' : '#ffffff'
}
