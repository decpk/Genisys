import { memo } from 'react'

import { cn } from '@/lib/utils'

import {
  AGENDA_SECTION_LABEL_RING,
  AGENDA_SECTION_LABEL_STYLES as s,
} from './AgendaSectionLabel.styles'
import type { AgendaSectionLabelProps } from './AgendaSectionLabel.types'

/**
 * Sub-section header used inside the Today's Agenda tile (e.g. "TASKS 0/2",
 * "MEETINGS 3 total"). Matches the flat / chip-pill aesthetic of DayView's
 * `SectionHeader` but compressed for a 400px-tall dashboard tile.
 */
export const AgendaSectionLabel = memo(function AgendaSectionLabel(
  props: AgendaSectionLabelProps
): React.JSX.Element {
  const { label, count, variant = 'amber' } = props
  const countClass = cn(s.countBase, AGENDA_SECTION_LABEL_RING[variant])
  const hasCount = count !== undefined && count !== ''

  return (
    <div className={s.row}>
      <div className={s.label}>{label}</div>
      {hasCount && <span className={countClass}>{count}</span>}
    </div>
  )
})
