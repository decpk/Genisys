import type { FaceProps } from '../../FullscreenClock.types'

const AURORA_GRADIENT =
  'linear-gradient(120deg, #f472b6 0%, #c084fc 20%, #60a5fa 40%, #34d399 60%, #fbbf24 80%, #f472b6 100%)'

const TEXT_STYLE: React.CSSProperties = {
  backgroundImage: AURORA_GRADIENT,
  backgroundSize: '300% 300%',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  filter: 'drop-shadow(0 0 28px rgba(244, 114, 182, 0.35))',
}

export function AuroraFace(props: FaceProps): React.JSX.Element {
  const { parts } = props

  return (
    <div className="relative flex items-baseline gap-3 font-bold tracking-tight tabular-nums leading-none">
      <span className="text-[clamp(4.5rem,11vw,13rem)] animate-clock-aurora" style={TEXT_STYLE}>
        {parts.hh}
      </span>
      <span
        className="text-[clamp(4.5rem,11vw,13rem)] animate-clock-aurora animate-pulse"
        style={{ ...TEXT_STYLE, animationDuration: '8s, 1.5s' }}
      >
        :
      </span>
      <span className="text-[clamp(4.5rem,11vw,13rem)] animate-clock-aurora" style={TEXT_STYLE}>
        {parts.mm}
      </span>
      <div className="ml-4 flex flex-col items-start gap-2 self-center">
        <span
          className="text-[clamp(1rem,1.8vw,2rem)] font-bold tabular-nums animate-clock-aurora"
          style={TEXT_STYLE}
        >
          {parts.ss}
        </span>
        <span
          className="text-[clamp(0.875rem,1.2vw,1.25rem)] tracking-[0.3em] font-bold animate-clock-aurora"
          style={TEXT_STYLE}
        >
          {parts.ampm}
        </span>
      </div>
    </div>
  )
}
