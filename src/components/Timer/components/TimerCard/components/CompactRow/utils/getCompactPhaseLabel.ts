import type { TimerPhase } from '@/store/timer-store/timer-store.types'

const COMPACT_PHASE_LABEL_MAP: Record<TimerPhase, string> = {
  idle: 'Idle',
  work: 'Work',
  'short-break': 'Short break',
  'long-break': 'Long break',
  running: 'Running',
  paused: 'Paused',
  complete: 'Complete',
}

export function getCompactPhaseLabel(phase: TimerPhase): string {
  return COMPACT_PHASE_LABEL_MAP[phase] ?? phase
}
