import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

/**
 * Removes a custom preset by id. No-op for ids that don't match a custom
 * preset (built-ins are immutable and cannot be deleted).
 */
export function removePresetAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const next = state.customPresets.filter((p) => p.id !== id)
  if (next.length === state.customPresets.length) return
  set({ customPresets: next })
  schedulePersist(get)
}
