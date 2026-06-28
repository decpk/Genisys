import { memo } from 'react'

import { CircularTimerRing } from '@/components/Timer/components/CircularTimerRing'

import { formatTimerTileDisplay } from '../../utils/formatTimerTileDisplay'

interface TimerTileDisplayProps {
  seconds: number
  phaseLabel: string
  accent: string
  /** Ring fill ratio in [0, 1]. */
  progress: number
  /** Hex color for the ring + glow. */
  ringColor: string
  /** Whether the primary timer is currently running. */
  isRunning: boolean
}

const RING_SIZE = 168
const RING_STROKE = 9

export const TimerTileDisplay = memo(function TimerTileDisplay(
  props: TimerTileDisplayProps,
): React.JSX.Element {
  const { seconds, phaseLabel, accent, progress, ringColor, isRunning } = props
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <CircularTimerRing
        size={RING_SIZE}
        strokeWidth={RING_STROKE}
        progress={progress}
        colorRing={ringColor}
        gradient
        glow={isRunning}
        glowIntensity="subtle"
        breathing={isRunning}
        tintedTrack
        centerLabel={formatTimerTileDisplay(seconds)}
      />
      <div
        className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] ${accent}`}
      >
        <span
          className={`size-1.5 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: ringColor }}
        />
        {phaseLabel}
      </div>
    </div>
  )
})
