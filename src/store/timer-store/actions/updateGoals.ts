import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type {
  TimerGoals,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function updateGoalsAction(
  get: Getter,
  set: Setter,
  partial: Partial<TimerGoals>,
): void {
  const state = get()
  set({ goals: { ...state.goals, ...partial } })
  schedulePersist(get)
}
