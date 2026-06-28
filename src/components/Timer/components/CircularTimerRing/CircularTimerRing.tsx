import { useId } from 'react'

import { cn } from '@/lib/utils'

import type { CircularTimerRingProps } from './CircularTimerRing.types'
import {
  RING_CENTER_CLASS,
  RING_LABEL_CLASS,
  RING_SUB_CLASS,
  RING_SVG_CLASS,
  RING_WRAPPER_CLASS,
} from './CircularTimerRing.styles'
import { RingGradientDefs } from './components/RingGradientDefs'
import { RingHalo } from './components/RingHalo'
import { resolveAccentColor } from './utils/resolveAccentColor'
import { resolveAnimationClass } from './utils/resolveAnimationClass'
import { resolveTrackColor } from './utils/resolveTrackColor'

export function CircularTimerRing(props: CircularTimerRingProps): React.JSX.Element {
  const {
    size,
    strokeWidth,
    progress,
    colorRing,
    colorTrack,
    pulse,
    centerLabel,
    subLabel,
    gradient,
    colorRingAccent,
    glow,
    glowIntensity,
    breathing,
    tintedTrack,
  } = props

  const rawId = useId()
  const gradientId = `timerRingGradient-${rawId.replace(/:/g, '-')}`

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const dashOffset = circumference * (1 - clamped)

  const trackColor = resolveTrackColor(colorRing, colorTrack, tintedTrack)
  const accentColor = resolveAccentColor(colorRing, colorRingAccent)
  const animationClass = resolveAnimationClass(pulse, breathing)
  const haloIntensity: 'subtle' | 'strong' = glowIntensity ?? 'subtle'
  const ringStroke = gradient ? `url(#${gradientId})` : colorRing

  const fontSize = Math.max(14, Math.floor(size * 0.18))
  const subNode = subLabel ? <div className={RING_SUB_CLASS}>{subLabel}</div> : null
  const haloNode = glow ? <RingHalo color={colorRing} intensity={haloIntensity} /> : null
  const defsNode = gradient ? (
    <RingGradientDefs id={gradientId} colorFrom={colorRing} colorTo={accentColor} />
  ) : null

  return (
    <div
      className={cn(RING_WRAPPER_CLASS, animationClass)}
      style={{ width: size, height: size }}
    >
      {haloNode}
      <svg width={size} height={size} className={RING_SVG_CLASS}>
        {defsNode}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.4s linear' }}
        />
      </svg>
      <div className={RING_LABEL_CLASS}>
        <div className={RING_CENTER_CLASS} style={{ fontSize }}>{centerLabel}</div>
        {subNode}
      </div>
    </div>
  )
}
