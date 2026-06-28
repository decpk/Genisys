import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

export function buildFocusBackdropStyle(color: string): React.CSSProperties {
  return {
    background: `radial-gradient(circle at 50% 30%, ${hexToRgba(color, 0.12)}, transparent 60%)`,
  }
}
