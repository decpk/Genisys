import type { TimerMode } from '@/store/timer-store/timer-store.types'

export const TIMER_EMPTY_STATE_HEADLINE = 'Ready when you are'

export const TIMER_EMPTY_STATE_SUB =
  'Pick a preset or create a new timer from the sidebar.'

export const TIMER_EMPTY_STATE_QUICK_START_LABEL = 'Quick start 25 min'

export const TIMER_EMPTY_STATE_QUICK_START_DURATION_SEC = 1500

export const TIMER_EMPTY_STATE_QUICK_START_NAME = 'Focus'

export const TIMER_EMPTY_STATE_QUICK_START_MODE: TimerMode = 'pomodoro'
