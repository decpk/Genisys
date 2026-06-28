import { createElement } from 'react'

import { ClockBriefingBottom } from './ClockBriefingBottom'
import { ClockBriefingTop } from './ClockBriefingTop'
import { useFullscreenClockData } from './hooks/useFullscreenClockData'
import { MonthCalendar } from './MonthCalendar'
import { getCardTransform } from './utils/getCardTransform'
import { getFaceComponent } from './utils/getFaceComponent'

export function FullscreenClock(): React.JSX.Element | null {
  const { mounted, visible, isLeaving, isHolding, leaveBeforeMs, hide, parts, now, dateLabel, face } =
    useFullscreenClockData()

  if (!mounted) return null

  const FaceComponent = getFaceComponent(face)

  // The backdrop (full-screen dim + blur + decorative blobs) lives in its
  // own layer so it can fade independently of the card. During PiP we want
  // the backdrop to disappear entirely so the small card reads as a real
  // detached mini window over the live desktop.
  const isInPip = isLeaving || !visible
  const backdropOpacity = isInPip ? 'opacity-0' : 'opacity-100'
  // While in PiP the chrome (briefing bands, decorative blobs) should
  // also disappear — the PiP is just the clock.
  const chromeOpacity = isInPip ? 'opacity-0' : 'opacity-100'
  const card = getCardTransform({ visible, isLeaving }, leaveBeforeMs)

  let dismissHint = 'Press Esc · Click anywhere to dismiss'
  if (isHolding) dismissHint = 'Release shortcut to dismiss'

  let dialogClickHandler: (() => void) | undefined = hide
  if (isHolding) dialogClickHandler = undefined

  return (
    <div
      role="dialog"
      aria-label="Fullscreen clock"
      onClick={dialogClickHandler}
      className="fixed inset-0 z-[10000] flex items-center justify-center select-none"
    >
      {/* Full-screen backdrop layer — fades out as we enter PiP so the
          card is the only thing visible. */}
      <div
        className={`absolute inset-0 bg-background/70 backdrop-blur-2xl transition-opacity duration-500 ${backdropOpacity}`}
      />

      {/* Decorative ambient blob — single soft tint, no pulsing. */}
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${backdropOpacity}`}
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] bg-primary/[0.06] rounded-full blur-3xl" />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={card.style}
        className={`relative flex w-[95vw] h-[95vh] flex-col items-center justify-start rounded-[2.5rem] border border-border/40 bg-card/45 backdrop-blur-xl overflow-hidden will-change-transform ${card.className}`}
      >
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${chromeOpacity}`}
        />

        {/* Vertical triptych: motivational quote on top, clock + calendar
            in the middle, daily briefing on the bottom. */}
        <div className="relative z-10 flex h-full w-full flex-col">
          <ClockBriefingTop now={now} isVisible={visible} chromeOpacity={chromeOpacity} />

          {/* Middle band — two-column clock + calendar row, vertically centered. */}
          <div className="flex flex-1 items-center">
            {/* Left column — face + date, vertically centered */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
              {createElement(FaceComponent, { parts, now })}
              <div className="text-[clamp(1rem,1.6vw,1.5rem)] font-light tracking-wide text-muted-foreground/60">
                {dateLabel}
              </div>
            </div>

            {/* Subtle vertical divider */}
            <div className="h-[70%] w-px bg-border/20" />

            {/* Right column — month calendar, vertically centered */}
            <div className="flex flex-1 items-center justify-center px-8">
              <MonthCalendar now={now} />
            </div>
          </div>

          <ClockBriefingBottom now={now} chromeOpacity={chromeOpacity} dismissHint={dismissHint} />
        </div>
      </div>
    </div>
  )
}
