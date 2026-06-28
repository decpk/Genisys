import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import { computeNextPhase } from '../utils/computeNextPhase'
import { getDurationForPhase } from '../utils/getDurationForPhase'
import type {
  TimerInstance,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

/**
 * Forces the current phase to complete and transitions to the next.
 * Does not log a completed session — skipping is treated as user-cancelled.
 */
export function skipPhaseAction(get: Getter, set: Setter, id: string): void {
  const state = get()
  const now = Date.now()
  let mutated = false

  const nextInstances: TimerInstance[] = state.instances.map((inst) => {
    if (inst.id !== id) return inst
    mutated = true

    const nextPhase = computeNextPhase(inst)
    const nextDuration =
      nextPhase === 'complete' || nextPhase === 'paused'
        ? 0
        : getDurationForPhase(inst, nextPhase)

    const completedSessionsInCycle =
      inst.mode === 'pomodoro' && inst.phase === 'work'
        ? inst.completedSessionsInCycle + 1
        : inst.completedSessionsInCycle

    return {
      ...inst,
      phase: nextPhase,
      remainingSec: nextDuration,
      isRunning: false,
      lastTickAt: null,
      completedSessionsInCycle,
      updatedAt: now,
    }
  })

  if (!mutated) return
  set({ instances: nextInstances })
  schedulePersist(get)
}
