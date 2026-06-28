import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sectionChevronStyles as s } from './SectionChevron.styles'
import type { SectionChevronProps } from './SectionChevron.types'

/**
 * Single rotating chevron used as the collapse / expand affordance on every
 * section header. A 180° rotation handles both states with a single icon.
 */
export function SectionChevron(props: SectionChevronProps): React.JSX.Element {
  const { collapsed } = props
  const rotationClass = collapsed ? s.iconCollapsed : s.iconExpanded
  const iconClass = cn(s.iconBase, rotationClass)

  return (
    <span className={s.wrapper}>
      <ChevronDown className={iconClass} />
    </span>
  )
}
