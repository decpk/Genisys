import type { SourceRowProps } from './SourceRow.types'
import { STYLES } from './SourceRow.styles'
import { getBrowserMeta } from '../../utils/getBrowserMeta'

/** A single selectable browser-source row in the import picker. */
export function SourceRow(props: SourceRowProps): React.JSX.Element {
  const { source, onPick } = props
  const meta = getBrowserMeta(source.browser)
  const Icon = meta.icon

  return (
    <button type="button" className={STYLES.row} onClick={() => onPick(source)}>
      <Icon size={16} className={STYLES.icon} />
      <span className={STYLES.label}>{source.label}</span>
    </button>
  )
}
