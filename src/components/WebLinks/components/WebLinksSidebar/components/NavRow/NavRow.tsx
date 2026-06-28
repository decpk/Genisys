import { cn } from '@/lib/utils'

import type { NavRowProps } from './NavRow.types'
import { STYLES } from './NavRow.styles'

/** A static, presentational sidebar nav row (e.g. "All" or "Unfiled"). */
export function NavRow(props: NavRowProps): React.JSX.Element {
  const { icon: Icon, label, count, isActive, onClick } = props

  const rowClass = cn(STYLES.row, isActive && STYLES.rowActive)

  return (
    <button type="button" className={rowClass} onClick={onClick}>
      <Icon size={15} className={STYLES.icon} />
      <span className={STYLES.label}>{label}</span>
      <span className={STYLES.count}>{count}</span>
    </button>
  )
}
