import type { BacklinkSectionProps } from './BacklinkSection.types'
import {
  bodyStyles,
  headerBadgeStyles,
  headerLabelStyles,
  headerStyles,
  sectionStyles,
} from './BacklinkSection.styles'

export function BacklinkSection(props: BacklinkSectionProps): React.JSX.Element {
  const { title, icon: Icon, count, children } = props

  return (
    <section className={sectionStyles}>
      <header className={headerStyles}>
        <Icon size={12} className="text-primary/60" />
        <span className={headerLabelStyles}>{title}</span>
        <span className={headerBadgeStyles}>{count}</span>
      </header>

      <div className={bodyStyles}>{children}</div>
    </section>
  )
}
