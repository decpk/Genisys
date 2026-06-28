import { hexToRgba } from '@/components/Timer/utils/hexToRgba'
import { lightenHex } from '@/components/Timer/utils/lightenHex'

export function buildCompactProgressStyle(
  color: string,
  width: string,
): React.CSSProperties {
  const accent = lightenHex(color, 0.25)
  return {
    width,
    background: `linear-gradient(90deg, ${color}, ${accent})`,
    boxShadow: `0 0 8px ${hexToRgba(color, 0.4)}`,
  }
}
