/** Day labels for the weekly bars (index 0 = today). */
export const TIMER_TILE_WEEKLY_DAY_LABELS = ['T', 'Y', '−2', '−3', '−4', '−5', '−6'] as const

export const TIMER_TILE_PHASE_LABELS = {
  work: 'Focus',
  'short-break': 'Short break',
  'long-break': 'Long break',
  idle: 'Ready',
  running: 'Running',
  paused: 'Paused',
  complete: 'Complete',
} as const
