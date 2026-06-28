import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type { TimerStoreActions, TimerStoreState } from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

/**
 * Resumes the given pending instances by setting them running and
 * stamping `lastTickAt`. Clears `pendingResumeIds` regardless.
 */
export function resumePendingAction(get: Getter, set: Setter, ids: string[]): void {
  const state = get()
  const now = Date.now()
  const toResume = new Set(ids)
  const next = state.instances.map((inst) => {
    if (!toResume.has(inst.id)) return inst
    if (inst.mode === 'stopwatch') {
      return { ...inst, isRunning: true, lastTickAt: now, updatedAt: now }
    }
    if (inst.remainingSec <= 0) return inst
    return {
      ...inst,
      isRunning: true,
      lastTickAt: now,
      updatedAt: now,
    }
  })
  set({ instances: next, pendingResumeIds: [] })
  schedulePersist(get)
}
