import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

export function buildGridBackdropStyle(color: string, isPrimary: boolean): React.CSSProperties {
  const intensity = isPrimary ? 0.14 : 0.08
  const wash = hexToRgba(color, intensity)
  return {
    background: `radial-gradient(circle at 20% 0%, ${wash}, transparent 65%)`,
  }
}
