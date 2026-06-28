/**
 * Parses an `hsl(H S% L%)` or `hsl(H, S%, L%)` color string.
 * Returns `null` if the input does not match the expected shape.
 */
export function parseHsl(value: string): { h: number; s: number; l: number } | null {
  const match = value
    .trim()
    .match(/^hsl\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*\)$/i)
  if (!match) return null
  const h = Number(match[1])
  const s = Number(match[2])
  const l = Number(match[3])
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return null
  return { h, s, l }
}
