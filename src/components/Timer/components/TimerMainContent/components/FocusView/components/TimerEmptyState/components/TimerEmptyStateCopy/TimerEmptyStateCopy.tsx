import { HEADLINE_CLASS, SUB_CLASS } from './TimerEmptyStateCopy.styles'
import type { TimerEmptyStateCopyProps } from './TimerEmptyStateCopy.types'

export function TimerEmptyStateCopy(props: TimerEmptyStateCopyProps): React.JSX.Element {
  const { headline, sub } = props
  return (
    <>
      <p className={HEADLINE_CLASS}>{headline}</p>
      <p className={SUB_CLASS}>{sub}</p>
    </>
  )
}
