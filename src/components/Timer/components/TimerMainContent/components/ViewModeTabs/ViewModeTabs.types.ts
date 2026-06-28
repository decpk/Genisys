import type { TimerView } from '../../TimerMainContent.types'

export interface ViewModeTabsProps {
  value: TimerView
  onChange: (next: TimerView) => void
}
