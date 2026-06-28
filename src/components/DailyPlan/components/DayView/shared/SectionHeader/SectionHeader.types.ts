import type { ReactNode } from 'react'
import type { SectionVariant } from '../constants/sectionVariants.constants'

export interface SectionHeaderProps {
  /** Drives icon chip + count chip variant tokens. */
  variant: SectionVariant
  /** Section title (e.g. "Today's Tasks", "Meetings", "Completed"). */
  title: string
  /** One-line micro-copy displayed under the title. */
  subtitle: string
  /** Pre-formatted count label (e.g. `"3"` or `"2/8"`). */
  countLabel: string
  /** Whether the section body is currently collapsed (drives chevron rotation). */
  collapsed: boolean
  /** When true, shows an emerald "all done" check next to the title. */
  allComplete?: boolean
  /** Click handler for the entire header button. */
  onToggle: () => void
  /**
   * Optional content rendered between the count chip and the chevron (e.g.
   * the progress bar on Today's Tasks).
   */
  rightSlot?: ReactNode
  /** Optional overflow/actions menu rendered in the trailing area, between rightSlot and the chevron. */
  menuSlot?: ReactNode
}
