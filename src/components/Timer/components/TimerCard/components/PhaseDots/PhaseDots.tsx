import { hexToRgba } from '@/components/Timer/utils/hexToRgba'

import type { PhaseDotsProps } from './PhaseDots.types'

const SEGMENT_BASE_CLASS = 'h-[3px] w-3 rounded-full transition-colors'
const SEGMENT_ACTIVE_CLASS = 'animate-pulse'

export function PhaseDots(props: PhaseDotsProps): React.JSX.Element {
  const { total, filled, color } = props
  const dimmed = hexToRgba(color, 0.18)
  const segments = Array.from({ length: Math.max(0, total) }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-1.5">
      {segments.map((i) => {
        const isOn = i < filled
        const isActive = i === filled
        const bg = isOn ? color : dimmed
        const className = isActive ? `${SEGMENT_BASE_CLASS} ${SEGMENT_ACTIVE_CLASS}` : SEGMENT_BASE_CLASS
        return <span key={i} className={className} style={{ backgroundColor: bg }} />
      })}
    </div>
  )
}
