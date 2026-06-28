import type { FaceProps } from '../../FullscreenClock.types'

import { FlipDigit } from './FlipDigit'
import { FLIP_FACE_PERSPECTIVE } from './FlipDigit/FlipDigit.styles'

const COLON_CLASS =
  'text-[clamp(2rem,4.4vw,5.5rem)] font-bold text-muted-foreground animate-pulse leading-none'

export function FlipFace(props: FaceProps): React.JSX.Element {
  const { parts } = props

  return (
    <div className="flex flex-col items-center gap-6" style={FLIP_FACE_PERSPECTIVE}>
      <div className="flex items-center gap-[clamp(0.25rem,0.6vw,0.75rem)]">
        <FlipDigit digit={parts.hh[0]} />
        <FlipDigit digit={parts.hh[1]} />
        <span className={COLON_CLASS} style={{ animationDuration: '2s' }}>
          :
        </span>
        <FlipDigit digit={parts.mm[0]} />
        <FlipDigit digit={parts.mm[1]} />
        <span className={COLON_CLASS} style={{ animationDuration: '2s' }}>
          :
        </span>
        <FlipDigit digit={parts.ss[0]} />
        <FlipDigit digit={parts.ss[1]} />
      </div>
      <div className="text-[clamp(0.875rem,1.2vw,1.25rem)] tracking-[0.3em] font-medium text-primary/80">
        {parts.ampm}
      </div>
    </div>
  )
}
