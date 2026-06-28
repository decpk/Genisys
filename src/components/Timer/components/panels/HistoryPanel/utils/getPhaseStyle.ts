import type { TimerPhase } from '@/store/timer-store/timer-store.types'

export interface PhaseStyle {
  /** Hex/CSS color for the small leading dot. */
  color: string
  /** Friendly label. */
  label: string
}

const STYLE_MAP: Record<string, PhaseStyle> = {
  work: { color: '#f59e0b', label: 'Work' },
  'short-break': { color: '#10b981', label: 'Short break' },
  'long-break': { color: '#3b82f6', label: 'Long break' },
  running: { color: '#8b5cf6', label: 'Stopwatch' },
  paused: { color: '#94a3b8', label: 'Paused' },
  complete: { color: '#10b981', label: 'Complete' },
  idle: { color: '#94a3b8', label: 'Idle' },
}

export function getPhaseStyle(phase: TimerPhase | string): PhaseStyle {
  return STYLE_MAP[phase] ?? { color: '#94a3b8', label: String(phase) }
}
