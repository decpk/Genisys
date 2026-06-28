export interface ClockBriefingTopProps {
  /** Current time tick. Used to derive today's key + fallback quote rotation. */
  now: Date
  /** True while the fullscreen clock is visible (used to trigger data load). */
  isVisible: boolean
  /** Tailwind opacity class (`opacity-0` while in PiP, `opacity-100` otherwise). */
  chromeOpacity: string
}

export interface ClockBriefingTopData {
  quote: string
  eyebrowLabel: string
}
