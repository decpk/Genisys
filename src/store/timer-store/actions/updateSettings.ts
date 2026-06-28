import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type {
  TimerSettings,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function updateSettingsAction(
  get: Getter,
  set: Setter,
  partial: Partial<TimerSettings>,
): void {
  const state = get()
  set({ settings: { ...state.settings, ...partial } })
  schedulePersist(get)
}
