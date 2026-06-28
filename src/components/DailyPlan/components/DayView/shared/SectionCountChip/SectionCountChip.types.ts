import type { SectionVariant } from '../constants/sectionVariants.constants'

export interface SectionCountChipProps {
  /** Pre-formatted label, e.g. `"3"` or `"2/8"`. Uses tabular-nums. */
  label: string
  /** Drives the inset accent ring color. */
  variant: SectionVariant
}
