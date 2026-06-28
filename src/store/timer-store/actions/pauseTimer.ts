import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type {
  TimerInstance,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function pauseTimerAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const now = Date.now()
  let mutated = false

  const nextInstances: TimerInstance[] = state.instances.map((inst) => {
    if (inst.id !== id) return inst
    if (!inst.isRunning) return inst
    mutated = true

    const phase: TimerInstance['phase'] =
      inst.mode === 'countdown' || inst.mode === 'stopwatch' ? 'paused' : inst.phase

    return {
      ...inst,
      phase,
      isRunning: false,
      lastTickAt: null,
      updatedAt: now,
    }
  })

  if (!mutated) return
  set({ instances: nextInstances })
  schedulePersist(get)
}
