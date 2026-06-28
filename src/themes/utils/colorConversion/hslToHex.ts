/**
 * Converts an HSL color (h: 0–360, s: 0–100, l: 0–100) to `#rrggbb`.
 * Useful for backing a native `<input type="color">` swatch.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100
  const a = sN * Math.min(lN, 1 - lN)
  const k = (n: number) => (n + h / 30) % 12
  const channel = (n: number) => {
    const c = lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(c * 255)
  }
  const r = channel(0)
  const g = channel(8)
  const b = channel(4)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
