import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

export function buildGridRootStyle(color: string, isPrimary: boolean): React.CSSProperties {
  if (!isPrimary) return {}
  return {
    boxShadow: `0 0 0 1px ${hexToRgba(color, 0.45)}, 0 8px 24px -12px ${hexToRgba(color, 0.55)}`,
  }
}
