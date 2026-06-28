import type { IdenticonGradient } from '../Identicon.types'

// Derive two pleasant, well-separated HSL hues from the hash for a gradient.
export function pickGradient(hash: number): IdenticonGradient {
  const hue1 = hash % 360
  const hue2 = (hue1 + 35 + ((hash >> 8) % 70)) % 360
  return {
    from: `hsl(${hue1} 68% 56%)`,
    to: `hsl(${hue2} 72% 44%)`,
  }
}
