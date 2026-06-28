/**
 * Deterministic color picker for tag rendering. Returns an HSL string from
 * a curated palette, picked by hashing the input id. The palette is
 * intentionally muted to play well with both light and dark themes.
 *
 * Pass `null` (untagged sessions) to receive the dedicated neutral color.
 */
const PALETTE = [
  'hsl(217 91% 60%)', // blue
  'hsl(160 60% 45%)', // emerald
  'hsl(280 65% 60%)', // violet
  'hsl(35 92% 55%)', // amber
  'hsl(340 75% 55%)', // pink
  'hsl(190 70% 45%)', // teal
  'hsl(15 85% 60%)', // orange
  'hsl(260 60% 65%)', // periwinkle
  'hsl(110 50% 50%)', // green
  'hsl(0 70% 60%)', // red
] as const

const NEUTRAL = 'hsl(220 10% 55%)'

function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function getTagColor(tagId: string | null): string {
  if (tagId === null || tagId === '') return NEUTRAL
  const idx = hashString(tagId) % PALETTE.length
  return PALETTE[idx]
}
