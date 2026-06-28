import { callTimerStyles as s } from './CallTimer.styles'
import type { CallTimerProps } from './CallTimer.types'
import { useCallTimerData } from './useCallTimerData'

export function CallTimer(props: CallTimerProps): React.JSX.Element {
  const { startedAt } = props
  const { label } = useCallTimerData(startedAt)

  return <span className={s.timer}>{label}</span>
}
