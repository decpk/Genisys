import { Check } from 'lucide-react'
import { sectionDoneCheckStyles as s } from './SectionDoneCheck.styles'

/**
 * Small emerald "all done" check shown next to a section title when every
 * item in that section (tasks / meetings / reviews) is complete. Purely
 * presentational — the parent decides when to render it.
 */
export function SectionDoneCheck(): React.JSX.Element {
  return (
    <span className={s.wrap} role="img" aria-label="All complete" title="All complete">
      <span className={s.badge}>
        <Check className={s.icon} />
      </span>
      <span className={s.label}>All done</span>
    </span>
  )
}
