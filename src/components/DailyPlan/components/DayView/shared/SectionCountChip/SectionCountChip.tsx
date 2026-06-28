import { cn } from '@/lib/utils'
import { SECTION_VARIANT_TOKENS } from '../constants/sectionVariants.constants'
import { sectionCountChipStyles as s } from './SectionCountChip.styles'
import type { SectionCountChipProps } from './SectionCountChip.types'

/**
 * Glass numeric chip displayed next to the section title. The ring color is
 * variant-tinted so the chip reads as part of the section's identity while
 * the background stays neutral and theme-safe.
 */
export function SectionCountChip(props: SectionCountChipProps): React.JSX.Element {
  const { label, variant } = props
  const tokens = SECTION_VARIANT_TOKENS[variant]
  const chipClass = cn(s.chip, tokens.countChipRingClass)

  return <span className={chipClass}>{label}</span>
}
