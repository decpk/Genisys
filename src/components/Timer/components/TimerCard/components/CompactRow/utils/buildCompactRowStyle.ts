import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

export function buildCompactRowStyle(
  color: string,
  isPrimary: boolean,
): React.CSSProperties {
  if (!isPrimary) return {}
  return {
    backgroundColor: hexToRgba(color, 0.05),
  }
}
