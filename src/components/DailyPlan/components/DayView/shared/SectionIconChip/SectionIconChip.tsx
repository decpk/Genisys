import { cn } from '@/lib/utils'
import { SECTION_VARIANT_TOKENS } from '../constants/sectionVariants.constants'
import { sectionIconChipStyles as s } from './SectionIconChip.styles'
import type { SectionIconChipProps } from './SectionIconChip.types'

/**
 * Small glass icon chip used in the left-most slot of each section header.
 * Background, ring, and inner highlight come from the variant tokens; the
 * child icon's color also follows the variant (emerald / blue / emerald-on-slate).
 */
export function SectionIconChip(props: SectionIconChipProps): React.JSX.Element {
  const { variant } = props
  const tokens = SECTION_VARIANT_TOKENS[variant]
  const Icon = tokens.icon

  const chipClass = cn(s.chip, tokens.iconChipClass)
  const iconClass = cn(s.icon, tokens.iconColorClass)

  return (
    <div className={chipClass}>
      <Icon className={iconClass} />
    </div>
  )
}
