import { cn } from '@/lib/utils'
import { SECTION_VARIANT_TOKENS } from '../constants/sectionVariants.constants'
import { sectionShellStyles as s } from './SectionShell.styles'
import type { SectionShellProps } from './SectionShell.types'

/**
 * Outer glass-card shell used by every DayView section (Tasks, Meetings,
 * Completed). Renders a subtle solid surface with a variant-tinted ring and
 * a soft colored shadow halo — no body gradient, no radial overlay.
 */
export function SectionShell(props: SectionShellProps): React.JSX.Element {
  const { variant, children } = props
  const tokens = SECTION_VARIANT_TOKENS[variant]
  const shellClass = cn(s.shellBase, tokens.shellClass)

  return (
    <div className={shellClass}>
      <div className={s.content}>{children}</div>
    </div>
  )
}
