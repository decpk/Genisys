import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

import type { GridPrimaryBadgeProps } from './GridPrimaryBadge.types'

const ROOT_CLASS =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]'

export function GridPrimaryBadge(props: GridPrimaryBadgeProps): React.JSX.Element {
  const { color } = props
  const style: React.CSSProperties = {
    color,
    backgroundColor: hexToRgba(color, 0.14),
  }
  return (
    <span className={ROOT_CLASS} style={style}>
      Primary
    </span>
  )
}
