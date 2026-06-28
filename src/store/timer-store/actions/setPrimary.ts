import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function setPrimaryAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  if (!state.instances.some((i) => i.id === id)) return
  set({ primaryId: id })
  schedulePersist(get)
}
