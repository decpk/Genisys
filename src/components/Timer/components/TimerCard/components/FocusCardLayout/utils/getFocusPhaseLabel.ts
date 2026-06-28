import type { TimerPhase } from '@/store/timer-store/timer-store.types'

const PHASE_LABEL_MAP: Record<TimerPhase, string> = {
  idle: 'Ready',
  work: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
  running: 'Running',
  paused: 'Paused',
  complete: 'Complete',
}

export function getFocusPhaseLabel(phase: TimerPhase): string {
  return PHASE_LABEL_MAP[phase] ?? phase
}
