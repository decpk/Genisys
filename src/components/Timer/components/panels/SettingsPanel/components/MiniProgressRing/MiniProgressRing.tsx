import { cn } from '@/lib/utils'

import type { MiniProgressRingProps } from './MiniProgressRing.types'

function clampProgress(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export function MiniProgressRing(props: MiniProgressRingProps): React.JSX.Element {
  const { color, size = 32, strokeWidth = 3, progress = 0.65, className } = props

  const safeProgress = clampProgress(progress)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - safeProgress)
  const center = size / 2

  return (
    <span
      className={cn('inline-flex shrink-0 text-muted-foreground', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
    </span>
  )
}
