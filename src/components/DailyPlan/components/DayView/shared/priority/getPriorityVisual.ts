/**
 * Shared priority → visual descriptor for DayView item cards (Task / Meeting /
 * Review). Replaces the old multi-layer accent treatment (glowing left bar +
 * tinted wash + hover orb) with a single, calm signal: a small colored dot.
 *
 * Only the high-attention tiers (`urgent` / `critical` / `high`) get an
 * emphasized dot + a short label so they stand out; `medium` / `low` stay
 * muted so a stacked list reads clean instead of rainbow-noisy.
 */
export interface PriorityVisual {
  /** Dot color (hex). */
  color: string
  /** Short uppercase label, shown only for high-attention tiers. */
  label: string | null
  /** Whether this tier should visually stand out (ring halo + label). */
  emphasized: boolean
}

const PRIORITY_VISUALS: Record<string, PriorityVisual> = {
  urgent: { color: '#ef4444', label: 'Urgent', emphasized: true },
  critical: { color: '#ef4444', label: 'Critical', emphasized: true },
  high: { color: '#f97316', label: 'High', emphasized: true },
  medium: { color: '#eab308', label: null, emphasized: false },
  low: { color: '#64748b', label: null, emphasized: false },
}

/** Muted slate used for completed/archived rows — priority no longer matters. */
export const COMPLETED_PRIORITY_VISUAL: PriorityVisual = {
  color: '#64748b',
  label: null,
  emphasized: false,
}

/** Pure: maps a priority string to its visual descriptor. */
export function getPriorityVisual(priority: string): PriorityVisual {
  return PRIORITY_VISUALS[priority] ?? PRIORITY_VISUALS.medium
}
