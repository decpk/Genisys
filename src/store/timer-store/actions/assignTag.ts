import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function assignTagAction(
  get: Getter,
  set: Setter,
  instanceId: string,
  tagId: string | null,
): void {
  const state = get()
  const now = Date.now()
  set({
    instances: state.instances.map((i) =>
      i.id === instanceId
        ? { ...i, tagId: tagId ?? undefined, updatedAt: now }
        : i,
    ),
  })
  schedulePersist(get)
}
