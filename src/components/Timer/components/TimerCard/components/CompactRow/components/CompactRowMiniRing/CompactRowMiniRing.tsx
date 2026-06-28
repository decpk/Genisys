import { CircularTimerRing } from '../../../../../CircularTimerRing'

import type { CompactRowMiniRingProps } from './CompactRowMiniRing.types'

const SIZE = 28
const STROKE = 3

export function CompactRowMiniRing(props: CompactRowMiniRingProps): React.JSX.Element {
  const { color, progress, isRunning } = props
  return (
    <div className="shrink-0">
      <CircularTimerRing
        size={SIZE}
        strokeWidth={STROKE}
        progress={progress}
        colorRing={color}
        gradient
        glow={isRunning}
        glowIntensity="subtle"
        tintedTrack
        centerLabel=""
      />
    </div>
  )
}
