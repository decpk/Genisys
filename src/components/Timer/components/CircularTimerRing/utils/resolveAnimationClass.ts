import { RING_BREATHING_CLASS, RING_PULSE_CLASS } from '../CircularTimerRing.styles'

export function resolveAnimationClass(
  pulse: boolean | undefined,
  breathing: boolean | undefined,
): string {
  if (breathing === true) return RING_BREATHING_CLASS
  if (pulse) return RING_PULSE_CLASS
  return ''
}
