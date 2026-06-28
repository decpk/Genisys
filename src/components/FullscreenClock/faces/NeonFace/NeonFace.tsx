import type { FaceProps } from '../../FullscreenClock.types'

import { getNeonGlow } from './utils/getNeonGlow'

export function NeonFace(props: FaceProps): React.JSX.Element {
  const { parts } = props
  const glow = getNeonGlow()

  return (
    <div className="relative flex items-baseline gap-3 font-light tracking-tight text-primary tabular-nums leading-none">
      <span className="text-[clamp(4.5rem,11vw,13rem)]" style={{ textShadow: glow }}>
        {parts.hh}
      </span>
      <span
        className="text-[clamp(4.5rem,11vw,13rem)] animate-pulse"
        style={{ textShadow: glow, animationDuration: '1.5s' }}
      >
        :
      </span>
      <span className="text-[clamp(4.5rem,11vw,13rem)]" style={{ textShadow: glow }}>
        {parts.mm}
      </span>
      <div className="ml-4 flex flex-col items-start gap-2 self-center">
        <span
          className="text-[clamp(1rem,1.8vw,2rem)] font-light tabular-nums text-primary/90"
          style={{ textShadow: glow }}
        >
          {parts.ss}
        </span>
        <span
          className="text-[clamp(0.875rem,1.2vw,1.25rem)] tracking-[0.3em] font-medium text-primary"
          style={{ textShadow: glow }}
        >
          {parts.ampm}
        </span>
      </div>
    </div>
  )
}
