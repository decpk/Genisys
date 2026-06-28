import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type {
  TimerInstance,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function startTimerAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const now = Date.now()
  let mutated = false

  const nextInstances: TimerInstance[] = state.instances.map((inst) => {
    if (inst.id !== id) return inst
    mutated = true

    let phase = inst.phase
    let remainingSec = inst.remainingSec

    if (inst.mode === 'pomodoro') {
      if (phase === 'idle' || phase === 'complete') {
        phase = 'work'
        remainingSec = inst.durationSec
      }
    } else if (inst.mode === 'countdown') {
      if (phase === 'idle' || phase === 'complete' || phase === 'paused') {
        phase = 'running'
        if (remainingSec <= 0) remainingSec = inst.durationSec
      }
    } else {
      // stopwatch
      phase = 'running'
    }

    return {
      ...inst,
      phase,
      remainingSec,
      isRunning: true,
      lastTickAt: now,
      updatedAt: now,
    }
  })

  if (!mutated) return
  set({ instances: nextInstances })
  schedulePersist(get)
}
