import type { StoreApi } from 'zustand'

import { notify } from '@/frameworks/notification/notify'
import { playTimerSound } from '@/components/Timer/utils/playTimerSound'

import { persistImmediate } from '../timer-store.persistence'
import { computeNextPhase } from '../utils/computeNextPhase'
import { getDurationForPhase } from '../utils/getDurationForPhase'
import type {
  TimerInstance,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'
import { logCompletedSessionAction } from './logCompletedSession'

const PHASE_LABELS: Record<string, string> = {
  work: 'Work session complete',
  running: 'Timer complete',
  'short-break': 'Short break complete',
  'long-break': 'Long break complete',
}

function getCompletionTitle(phase: TimerInstance['phase']): string {
  return PHASE_LABELS[phase] ?? 'Timer complete'
}

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

interface PendingCompletion {
  instanceId: string
  durationSec: number
  phase: TimerInstance['phase']
}

interface PendingEffect {
  instanceId: string
  soundProfileId: string
  completedPhase: TimerInstance['phase']
  instanceName: string
}

/**
 * Single dispatch ticking ALL running instances using wall-clock delta.
 * - stopwatch: increments elapsedSec.
 * - countdown / pomodoro: decrements remainingSec; on phase complete,
 *   logs the work session, transitions to the next phase, and either
 *   auto-starts the break or pauses awaiting user start.
 */
export function tickAction(get: Getter, set: Setter): void {
  const state = get()
  if (!state.instances.some((i) => i.isRunning)) return

  const now = Date.now()
  const completions: PendingCompletion[] = []
  const effects: PendingEffect[] = []

  const nextInstances: TimerInstance[] = state.instances.map((inst) => {
    if (!inst.isRunning) return inst

    const elapsed = inst.lastTickAt
      ? Math.floor((now - inst.lastTickAt) / 1000)
      : 1
    if (elapsed <= 0) {
      return { ...inst, lastTickAt: inst.lastTickAt ?? now }
    }

    if (inst.mode === 'stopwatch') {
      return {
        ...inst,
        elapsedSec: inst.elapsedSec + elapsed,
        lastTickAt: now,
        updatedAt: now,
      }
    }

    const newRemaining = inst.remainingSec - elapsed
    if (newRemaining > 0) {
      return {
        ...inst,
        remainingSec: newRemaining,
        lastTickAt: now,
        updatedAt: now,
      }
    }

    // Phase complete.
    const completedPhase = inst.phase
    const completedDuration = inst.durationSec
    const nextPhase = computeNextPhase(inst)
    const isWork = completedPhase === 'work' || completedPhase === 'running'
    if (isWork) {
      completions.push({
        instanceId: inst.id,
        durationSec: completedDuration,
        phase: completedPhase,
      })
    }

    effects.push({
      instanceId: inst.id,
      soundProfileId: inst.soundProfileId,
      completedPhase,
      instanceName: inst.name,
    })

    const nextDuration =
      nextPhase === 'complete' || nextPhase === 'paused'
        ? 0
        : getDurationForPhase(inst, nextPhase)

    const shouldAutoStart =
      inst.mode === 'pomodoro' &&
      inst.autoStartBreak &&
      (nextPhase === 'short-break' || nextPhase === 'long-break')

    const completedSessionsInCycle =
      inst.mode === 'pomodoro' && completedPhase === 'work'
        ? inst.completedSessionsInCycle + 1
        : inst.completedSessionsInCycle

    return {
      ...inst,
      phase: nextPhase,
      remainingSec: nextDuration,
      isRunning: shouldAutoStart,
      lastTickAt: shouldAutoStart ? now : null,
      completedSessionsInCycle,
      updatedAt: now,
    }
  })

  set({ instances: nextInstances })

  for (const c of completions) {
    logCompletedSessionAction(get, set, c.instanceId, c.durationSec, c.phase)
  }

  const settings = get().settings
  for (const e of effects) {
    const isWorkPhase =
      e.completedPhase === 'work' || e.completedPhase === 'running'
    const event = isWorkPhase ? 'work-end' : 'break-end'
    playTimerSound(e.soundProfileId, event)

    if (!settings.notificationsEnabled) continue

    const skipAction = isWorkPhase
      ? [
          {
            label: 'Skip break',
            onClick: () => get().skipPhase(e.instanceId),
          },
        ]
      : []

    notify({
      source: 'timer',
      channel: 'os',
      type: 'success',
      title: getCompletionTitle(e.completedPhase),
      message: e.instanceName,
      actions: skipAction,
    })
  }

  persistImmediate(get)
}
