import { useMemo } from 'react'

import type { FaceProps } from '../../FullscreenClock.types'

import { getHandAngles } from './utils/getHandAngles'
import { buildClockTicks } from './utils/buildClockTicks'

export function AnalogFace(props: FaceProps): React.JSX.Element {
  const { now } = props
  const angles = getHandAngles(now)
  const ticks = useMemo(() => buildClockTicks(), [])

  return (
    <svg viewBox="0 0 200 200" className="w-[min(60vh,30vw)] h-[min(60vh,30vw)] text-foreground">
      <defs>
        <radialGradient id="clockBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#clockBg)" />
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1"
      />

      {ticks.map((t) => (
        <line
          key={t.index}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeOpacity={t.isHour ? 0.7 : 0.3}
          strokeWidth={t.isHour ? 1.5 : 0.75}
          strokeLinecap="round"
        />
      ))}

      <line
        x1="100"
        y1="100"
        x2="100"
        y2="55"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${angles.hour} 100 100)`}
      />
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${angles.minute} 100 100)`}
      />
      <line
        x1="100"
        y1="108"
        x2="100"
        y2="22"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        transform={`rotate(${angles.second} 100 100)`}
      />
      <circle cx="100" cy="100" r="3.5" fill="currentColor" />
      <circle cx="100" cy="100" r="1.5" className="text-primary" fill="currentColor" />
    </svg>
  )
}
