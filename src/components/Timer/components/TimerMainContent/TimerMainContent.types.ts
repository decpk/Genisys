import type { TimerInstance, TimerSettings } from '@/store/timer-store/timer-store.types'

export type TimerView = TimerSettings['lastView']

export interface UseTimerMainContentDataReturn {
  primary: TimerInstance | null
  primaryId: string | null
  instances: TimerInstance[]
  view: TimerView
  setView: (view: TimerView) => void
}
