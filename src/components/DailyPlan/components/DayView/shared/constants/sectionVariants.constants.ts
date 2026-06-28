import type { ComponentType } from 'react'
import { CalendarClock, CheckCircle2, ClipboardCheck, ListChecks } from 'lucide-react'

/**
 * A section variant drives the visual identity of a DayView card section:
 * the icon, the chip background, the colored shadow halo, and the muted
 * ring color used by `SectionShell` and `SectionHeader`.
 *
 *  - `tasks`     → emerald-tinted glass (Today's Tasks)
 *  - `reviews`   → purple-tinted glass  (Reviews)
 *  - `meetings`  → blue-tinted glass    (Meetings)
 *  - `completed` → slate-tinted glass with an emerald check (Completed)
 */
export type SectionVariant = 'tasks' | 'reviews' | 'meetings' | 'completed'

export interface SectionVariantTokens {
  /** Lucide icon rendered inside `SectionIconChip`. */
  icon: ComponentType<{ className?: string }>
  /** Optional override for the icon color class (e.g. emerald check on completed). */
  iconColorClass: string
  /** Tailwind classes for the icon chip background + ring + inner highlight. */
  iconChipClass: string
  /**
   * Tailwind classes for the outer `SectionShell` — a subtle solid surface
   * with a variant-tinted ring and colored shadow halo for identity. No
   * vertical body gradient.
   */
  shellClass: string
  /** Tailwind classes for the accent ring used by the count chip. */
  countChipRingClass: string
}

const TASKS: SectionVariantTokens = {
  icon: ListChecks,
  iconColorClass: 'text-emerald-500',
  iconChipClass: 'bg-emerald-500/20',
  shellClass: 'bg-card/85',
  countChipRingClass: 'ring-emerald-500/20',
}

const MEETINGS: SectionVariantTokens = {
  icon: CalendarClock,
  iconColorClass: 'text-blue-500',
  iconChipClass: 'bg-blue-500/20',
  shellClass: 'bg-card/85',
  countChipRingClass: 'ring-blue-500/20',
}

const COMPLETED: SectionVariantTokens = {
  icon: CheckCircle2,
  iconColorClass: 'text-emerald-500/85',
  iconChipClass: 'bg-slate-500/15',
  shellClass: 'bg-card/75',
  countChipRingClass: 'ring-slate-400/20',
}

const REVIEWS: SectionVariantTokens = {
  icon: ClipboardCheck,
  iconColorClass: 'text-purple-500',
  iconChipClass: 'bg-purple-500/20',
  shellClass: 'bg-card/85',
  countChipRingClass: 'ring-purple-500/20',
}

export const SECTION_VARIANT_TOKENS: Record<SectionVariant, SectionVariantTokens> = {
  tasks: TASKS,
  reviews: REVIEWS,
  meetings: MEETINGS,
  completed: COMPLETED,
}
