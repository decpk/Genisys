import { hexToRgba } from '@/components/Timer/utils/hexToRgba'
import { lightenHex } from '@/components/Timer/utils/lightenHex'

export function buildDailyGoalMeterStyle(color: string, percent: number): React.CSSProperties {
  const accent = lightenHex(color, 0.25)
  const clamped = Math.max(0, Math.min(100, percent))
  return {
    width: `${clamped}%`,
    background: `linear-gradient(90deg, ${color}, ${accent})`,
    boxShadow: `0 0 6px ${hexToRgba(color, 0.45)}`,
  }
}
