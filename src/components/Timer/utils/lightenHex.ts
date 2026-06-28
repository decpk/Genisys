export function lightenHex(hex: string, amount: number): string {
  let normalized = hex.trim()
  if (!normalized.startsWith('#')) return hex
  normalized = normalized.slice(1)
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return hex

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const c = max - min

  let h = 0
  let s = 0
  if (c !== 0) {
    s = c / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / c + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / c + 2) / 6
    else h = ((r - g) / c + 4) / 6
  }

  const newL = Math.min(1, Math.max(0, l + amount * (1 - l)))

  const c2 = (1 - Math.abs(2 * newL - 1)) * s
  const x = c2 * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = newL - c2 / 2

  let r2 = 0
  let g2 = 0
  let b2 = 0
  if (h < 1 / 6) { r2 = c2; g2 = x; b2 = 0 }
  else if (h < 2 / 6) { r2 = x; g2 = c2; b2 = 0 }
  else if (h < 3 / 6) { r2 = 0; g2 = c2; b2 = x }
  else if (h < 4 / 6) { r2 = 0; g2 = x; b2 = c2 }
  else if (h < 5 / 6) { r2 = x; g2 = 0; b2 = c2 }
  else { r2 = c2; g2 = 0; b2 = x }

  const toHex = (val: number): string => {
    const out = Math.round((val + m) * 255).toString(16)
    return out.length === 1 ? '0' + out : out
  }
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`
}
