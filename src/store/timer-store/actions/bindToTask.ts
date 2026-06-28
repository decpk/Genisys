import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function bindToTaskAction(
  get: Getter,
  set: Setter,
  instanceId: string,
  dailyPlanTaskId: string | null,
): void {
  const state = get()
  const now = Date.now()
  set({
    instances: state.instances.map((i) =>
      i.id === instanceId
        ? { ...i, dailyPlanTaskId: dailyPlanTaskId ?? undefined, updatedAt: now }
        : i,
    ),
  })
  schedulePersist(get)
}
