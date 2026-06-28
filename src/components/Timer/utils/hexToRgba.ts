export function hexToRgba(hex: string, alpha: number): string {
  let normalized = hex.trim()
  if (!normalized.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`
  normalized = normalized.slice(1)
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(0, 0, 0, ${alpha})`

  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
