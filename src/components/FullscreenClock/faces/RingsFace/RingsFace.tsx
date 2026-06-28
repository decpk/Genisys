import type { FaceProps } from '../../FullscreenClock.types'

import { getRingProgress } from './utils/getRingProgress'

interface RingDef {
  radius: number
  strokeWidth: number
  pct: number
  color: string
  opacity: number
}

export function RingsFace(props: FaceProps): React.JSX.Element {
  const { parts, now } = props
  const progress = getRingProgress(now)

  const rings: RingDef[] = [
    { radius: 96, strokeWidth: 3, pct: progress.hourPct, color: 'text-primary', opacity: 0.9 },
    { radius: 80, strokeWidth: 2.5, pct: progress.minutePct, color: 'text-foreground', opacity: 0.7 },
    { radius: 64, strokeWidth: 1.5, pct: progress.secondPct, color: 'text-primary', opacity: 0.5 },
  ]

  return (
    <div className="relative w-[min(65vh,32vw)] h-[min(65vh,32vw)] flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0">
        {rings.map((ring) => {
          const circumference = 2 * Math.PI * ring.radius
          const dash = circumference * ring.pct
          return (
            <g
              key={ring.radius}
              transform="rotate(-90 100 100)"
              className={ring.color}
            >
              <circle
                cx="100"
                cy="100"
                r={ring.radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={ring.strokeWidth}
              />
              <circle
                cx="100"
                cy="100"
                r={ring.radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={ring.opacity}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </g>
          )
        })}
      </svg>

      <div className="relative flex flex-col items-center gap-2 font-light tracking-tight text-foreground tabular-nums leading-none">
        <div className="flex items-baseline gap-2">
          <span className="text-[clamp(2rem,4.5vw,5.5rem)]">{parts.hh}</span>
          <span className="text-[clamp(2rem,4.5vw,5.5rem)] opacity-80 animate-pulse" style={{ animationDuration: '2s' }}>
            :
          </span>
          <span className="text-[clamp(2rem,4.5vw,5.5rem)]">{parts.mm}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-[clamp(0.75rem,1vw,1.1rem)] tabular-nums">{parts.ss}</span>
          <span className="text-[clamp(0.625rem,1vw,1rem)] tracking-[0.3em] font-medium text-primary/80">
            {parts.ampm}
          </span>
        </div>
      </div>
    </div>
  )
}
