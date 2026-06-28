import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

/**
 * Toggles pin state for any preset id. If the id matches a custom preset,
 * the `pinned` field is flipped on the preset. Otherwise the id is treated
 * as a built-in and toggled in `pinnedBuiltInIds`.
 */
export function togglePresetPinAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const customIdx = state.customPresets.findIndex((p) => p.id === id)
  const now = Date.now()

  if (customIdx >= 0) {
    const next = state.customPresets.slice()
    const target = next[customIdx]
    next[customIdx] = { ...target, pinned: !target.pinned, updatedAt: now }
    set({ customPresets: next })
    schedulePersist(get)
    return
  }

  const isPinned = state.pinnedBuiltInIds.includes(id)
  const nextIds = isPinned
    ? state.pinnedBuiltInIds.filter((x) => x !== id)
    : [...state.pinnedBuiltInIds, id]
  set({ pinnedBuiltInIds: nextIds })
  schedulePersist(get)
}
