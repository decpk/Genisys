import { getThemeById } from '@/components/Timer/utils/getThemeById'
import type { TimerPhase } from '@/store/timer-store/timer-store.types'

/** Fallback ring color when no theme is resolved (sky-500). */
const DEFAULT_RING_COLOR = '#0ea5e9'

/** Phase-specific ring colors used by the Dashboard timer tile. */
const PHASE_RING_COLOR: Partial<Record<TimerPhase, string>> = {
  'short-break': '#10b981',
  'long-break': '#3b82f6',
  complete: '#10b981',
}

/**
 * Resolves the hex color used for the dashboard timer tile's progress ring.
 *
 * Break/complete phases use their own semantic colors; everything else falls
 * back to the instance's theme ring color (or a default sky tone).
 */
export function resolveTimerTileRingColor(
  phase: TimerPhase,
  themeId: string | undefined,
): string {
  const phaseColor = PHASE_RING_COLOR[phase]
  if (phaseColor) return phaseColor
  const theme = themeId ? getThemeById(themeId) : undefined
  return theme?.ringColor ?? DEFAULT_RING_COLOR
}
