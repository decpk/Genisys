import { cn } from '@/lib/utils'

import { TimerEmptyStateCopy } from './components/TimerEmptyStateCopy'
import { TimerEmptyStateCTA } from './components/TimerEmptyStateCTA'
import { TimerEmptyStateGlyph } from './components/TimerEmptyStateGlyph'
import {
  TIMER_EMPTY_STATE_HEADLINE,
  TIMER_EMPTY_STATE_QUICK_START_LABEL,
  TIMER_EMPTY_STATE_SUB,
} from './TimerEmptyState.constants'
import { COPY_WRAPPER_CLASS, GLYPH_WRAPPER_CLASS, ROOT_CLASS } from './TimerEmptyState.styles'
import type { TimerEmptyStateProps } from './TimerEmptyState.types'
import { useTimerEmptyStateData } from './useTimerEmptyStateData'

export function TimerEmptyState(props: TimerEmptyStateProps): React.JSX.Element {
  const { className } = props
  const { quickStart } = useTimerEmptyStateData()
  return (
    <div className={cn(ROOT_CLASS, className)}>
      <div className={GLYPH_WRAPPER_CLASS}>
        <TimerEmptyStateGlyph />
      </div>
      <div className={COPY_WRAPPER_CLASS}>
        <TimerEmptyStateCopy
          headline={TIMER_EMPTY_STATE_HEADLINE}
          sub={TIMER_EMPTY_STATE_SUB}
        />
      </div>
      <TimerEmptyStateCTA
        label={TIMER_EMPTY_STATE_QUICK_START_LABEL}
        onActivate={quickStart}
      />
    </div>
  )
}
