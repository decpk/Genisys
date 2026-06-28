import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function dismissPendingResumeAction(get: Getter, set: Setter): void {
  if (get().pendingResumeIds.length === 0) return
  set({ pendingResumeIds: [] })
  schedulePersist(get)
}
