import type { FaceProps } from '../../FullscreenClock.types'

export function MinimalFace(props: FaceProps): React.JSX.Element {
  const { parts, now } = props
  const secondsProgress = (now.getSeconds() + now.getMilliseconds() / 1000) / 60

  return (
    <>
      <div className="relative flex items-baseline gap-2 font-extralight tracking-tight text-foreground tabular-nums leading-none">
        <span className="text-[clamp(4.5rem,11vw,13rem)]">{parts.hh}</span>
        <span
          className="text-[clamp(4.5rem,11vw,13rem)] opacity-80 animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          :
        </span>
        <span className="text-[clamp(4.5rem,11vw,13rem)]">{parts.mm}</span>
        <div className="ml-4 flex flex-col items-start gap-2 self-center">
          <span className="text-[clamp(1rem,1.8vw,2rem)] font-light text-muted-foreground tabular-nums">
            {parts.ss}
          </span>
          <span className="text-[clamp(0.875rem,1.2vw,1.25rem)] tracking-[0.3em] font-medium text-primary/80">
            {parts.ampm}
          </span>
        </div>
      </div>
      <div className="relative mt-10 h-[3px] w-[min(20rem,30vw)] rounded-full bg-border/40 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${secondsProgress * 100}%` }}
        />
      </div>
    </>
  )
}
