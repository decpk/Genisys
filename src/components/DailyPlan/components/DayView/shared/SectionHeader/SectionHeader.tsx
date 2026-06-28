import { SectionChevron } from '../SectionChevron'
import { SectionCountChip } from '../SectionCountChip'
import { SectionDoneCheck } from '../SectionDoneCheck'
import { SectionIconChip } from '../SectionIconChip'
import { sectionHeaderStyles as s } from './SectionHeader.styles'
import type { SectionHeaderProps } from './SectionHeader.types'

/**
 * Collapsible section header used by every DayView card. Composes:
 *   IconChip · (Title + Subtitle) · CountChip · [rightSlot] · Chevron
 *
 * Renders a faded gradient divider below itself when expanded so the header
 * reads as a distinct band on the glass shell. The component is purely
 * presentational — collapse state and toggle are owned by the parent.
 */
export function SectionHeader(props: SectionHeaderProps): React.JSX.Element {
  const { variant, title, subtitle, countLabel, collapsed, allComplete, onToggle, rightSlot, menuSlot } = props
  const showDivider = !collapsed

  const dividerNode = showDivider ? <div className={s.divider} /> : null
  const doneNode = allComplete ? <SectionDoneCheck /> : null
  const chevronLabel = collapsed ? 'Expand section' : 'Collapse section'

  return (
    <>
      <div className={s.row}>
        <button type="button" onClick={onToggle} className={s.button}>
          <SectionIconChip variant={variant} />

          <div className={s.titleBlock}>
            <div className={s.titleRow}>
              <h3 className={s.title}>{title}</h3>
              <SectionCountChip label={countLabel} variant={variant} />
            </div>
            <span className={s.subtitle}>{subtitle}</span>
          </div>

          <div className={s.rightSlot}>{rightSlot}</div>
        </button>

        <div className={s.doneCenter}>{doneNode}</div>

        <div className={s.trailing}>
          {menuSlot}
          <button
            type="button"
            onClick={onToggle}
            className={s.chevronButton}
            aria-label={chevronLabel}
          >
            <SectionChevron collapsed={collapsed} />
          </button>
        </div>
      </div>
      {dividerNode}
    </>
  )
}
