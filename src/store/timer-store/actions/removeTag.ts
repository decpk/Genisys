import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function removeTagAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  set({
    tags: state.tags.filter((t) => t.id !== id),
    instances: state.instances.map((i) =>
      i.tagId === id ? { ...i, tagId: undefined } : i,
    ),
  })
  schedulePersist(get)
}
