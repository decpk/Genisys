import { CallTimer } from '../CallTimer'
import { callStatusLabelStyles as s } from './CallStatusLabel.styles'
import type { CallStatusLabelProps } from './CallStatusLabel.types'

export function CallStatusLabel(props: CallStatusLabelProps): React.JSX.Element | null {
  const { status, startedAt } = props

  if (status === 'outgoing') {
    return <span className={s.label}>Ringing…</span>
  }
  if (status === 'connecting') {
    return <span className={s.label}>Connecting…</span>
  }
  if (status === 'active') {
    return <CallTimer startedAt={startedAt} />
  }
  return null
}
