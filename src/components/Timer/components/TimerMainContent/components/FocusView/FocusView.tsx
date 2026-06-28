import { getThemeById } from '../../../../utils/getThemeById'
import { TimerCard } from '../../../TimerCard'

import { DailyGoalBadge } from './components/DailyGoalBadge'
import { TimerEmptyState } from './components/TimerEmptyState'
import {
  DEFAULT_FOCUS_RING_COLOR,
  FOCUS_VIEW_BACKDROP_CLASS,
  FOCUS_VIEW_INNER_CLASS,
  FOCUS_VIEW_ROOT_CLASS,
} from './FocusView.styles'
import type { FocusViewProps } from './FocusView.types'
import { buildFocusBackdropStyle } from './utils/buildFocusBackdropStyle'

export function FocusView(props: FocusViewProps): React.JSX.Element {
  const { primary } = props
  if (!primary) return <TimerEmptyState />

  const theme = getThemeById(primary.themeId)
  const ringColor = theme?.ringColor ?? DEFAULT_FOCUS_RING_COLOR
  const backdropStyle = buildFocusBackdropStyle(ringColor)

  return (
    <div className={FOCUS_VIEW_ROOT_CLASS}>
      <div className={FOCUS_VIEW_BACKDROP_CLASS} style={backdropStyle} aria-hidden />
      <div className={FOCUS_VIEW_INNER_CLASS}>
        <TimerCard instance={primary} view="focus" />
        <DailyGoalBadge accentColor={ringColor} />
      </div>
    </div>
  )
}
