import type { FaceProps } from '../../FullscreenClock.types'

// IMPORTANT: -webkit-text-stroke-color must be set EXPLICITLY (not via
// `currentColor`) because we set `color: transparent` to remove the fill —
// otherwise the stroke binds to `transparent` and the glyph disappears.
const STROKE_FOREGROUND: React.CSSProperties = {
  color: 'transparent',
  WebkitTextStrokeWidth: '2px',
  WebkitTextStrokeColor: 'var(--color-foreground)',
}

const STROKE_FOREGROUND_THIN: React.CSSProperties = {
  color: 'transparent',
  WebkitTextStrokeWidth: '1.5px',
  WebkitTextStrokeColor: 'var(--color-muted-foreground)',
}

const STROKE_PRIMARY: React.CSSProperties = {
  color: 'transparent',
  WebkitTextStrokeWidth: '2px',
  WebkitTextStrokeColor: 'var(--color-primary)',
}

const STROKE_PRIMARY_THIN: React.CSSProperties = {
  color: 'transparent',
  WebkitTextStrokeWidth: '1.5px',
  WebkitTextStrokeColor: 'var(--color-primary)',
}

export function WireframeFace(props: FaceProps): React.JSX.Element {
  const { parts } = props

  return (
    <div className="relative flex items-baseline gap-2 font-bold tracking-tight tabular-nums leading-none">
      <span className="text-[clamp(4.5rem,11vw,13rem)]" style={STROKE_FOREGROUND}>
        {parts.hh}
      </span>
      <span
        className="text-[clamp(4.5rem,11vw,13rem)] animate-pulse"
        style={{ ...STROKE_PRIMARY, animationDuration: '2s' }}
      >
        :
      </span>
      <span className="text-[clamp(4.5rem,11vw,13rem)]" style={STROKE_FOREGROUND}>
        {parts.mm}
      </span>
      <div className="ml-4 flex flex-col items-start gap-2 self-center">
        <span
          className="text-[clamp(1rem,1.8vw,2rem)] font-bold tabular-nums"
          style={STROKE_FOREGROUND_THIN}
        >
          {parts.ss}
        </span>
        <span
          className="text-[clamp(0.875rem,1.2vw,1.25rem)] tracking-[0.4em] font-bold"
          style={STROKE_PRIMARY_THIN}
        >
          {parts.ampm}
        </span>
      </div>
    </div>
  )
}
