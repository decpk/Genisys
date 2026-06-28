import { lightenHex } from '../../../utils/lightenHex'

export function resolveAccentColor(colorRing: string, colorRingAccent: string | undefined): string {
  if (colorRingAccent) return colorRingAccent
  return lightenHex(colorRing, 0.25)
}
