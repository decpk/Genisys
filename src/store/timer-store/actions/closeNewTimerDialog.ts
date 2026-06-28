import type { StoreApi } from 'zustand'

import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function closeNewTimerDialogAction(_get: Getter, set: Setter): void {
  set({ isNewTimerDialogOpen: false })
}
