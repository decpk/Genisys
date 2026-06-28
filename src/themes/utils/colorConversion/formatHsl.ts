/** Formats H/S/L numbers into the canonical `hsl(H S% L%)` string used by the theme system. */
export function formatHsl(h: number, s: number, l: number): string {
  const hh = Math.round(clamp(h, 0, 360))
  const ss = Math.round(clamp(s, 0, 100))
  const ll = Math.round(clamp(l, 0, 100))
  return `hsl(${hh} ${ss}% ${ll}%)`
}

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min
  if (n > max) return max
  return n
}
