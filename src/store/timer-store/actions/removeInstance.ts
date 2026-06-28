import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function removeInstanceAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const nextInstances = state.instances.filter((i) => i.id !== id)
  let nextPrimary = state.primaryId
  if (nextPrimary === id) {
    nextPrimary = nextInstances[0]?.id ?? null
  }
  set({ instances: nextInstances, primaryId: nextPrimary })
  schedulePersist(get)
}
