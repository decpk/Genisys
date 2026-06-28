import type { StoreApi } from 'zustand'

import {
  getTodayKey,
  readPersisted,
  schedulePersist,
} from '../timer-store.persistence'
import { migrateLegacyFocusTimer } from '../utils/migrateLegacyFocusTimer'
import { rollDailyCounters } from '../utils/rollDailyCounters'
import type {
  TimerInstance,
  TimerPersistedShape,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'
import { logCompletedSessionAction } from './logCompletedSession'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

/**
 * Hydrates from localStorage, applies wall-clock delta to running
 * instances (auto-completing any whose remainingSec went <= 0), then
 * rolls daily counters forward if the calendar day changed.
 */
export function hydrateAction(get: Getter, set: Setter): void {
  const persistedRaw = readPersisted()
  const today = getTodayKey()

  // One-time migration from the legacy `focus-timer` store. Imports the
  // aggregate counters into the new store the first time we hydrate when
  // no Timer state has been persisted yet, then deletes the legacy key.
  const migrated = migrateLegacyFocusTimer(persistedRaw)

  if (!persistedRaw && !migrated) {
    set({ todayKey: today, isHydrated: true })
    return
  }

  const persisted: TimerPersistedShape = persistedRaw ?? {
    instances: [],
    primaryId: null,
    settings: get().settings,
    tags: [],
    goals: get().goals,
    milestones: [],
    todaysCompletedSessions: migrated?.todaysCompletedSessions ?? 0,
    todaysFocusMinutes: migrated?.todaysFocusMinutes ?? 0,
    weeklyMinutes: migrated?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0],
    streakDays: 0,
    todayKey: today,
    lastSessionDayKey: null,
    customPresets: [],
    pinnedBuiltInIds: [],
  }

  const now = Date.now()
  const completedThisHydrate: Array<{
    instanceId: string
    durationSec: number
    phase: TimerInstance['phase']
  }> = []
  const pendingResumeIds: string[] = []

  const restored: TimerInstance[] = (persisted.instances ?? []).map((inst) => {
    if (!inst.isRunning || inst.lastTickAt == null) {
      return { ...inst, isRunning: false, lastTickAt: null }
    }
    const elapsed = Math.max(0, Math.floor((now - inst.lastTickAt) / 1000))
    if (inst.mode === 'stopwatch') {
      pendingResumeIds.push(inst.id)
      return {
        ...inst,
        elapsedSec: inst.elapsedSec + elapsed,
        isRunning: false,
        lastTickAt: null,
      }
    }
    const newRemaining = inst.remainingSec - elapsed
    if (newRemaining > 0) {
      pendingResumeIds.push(inst.id)
      return {
        ...inst,
        remainingSec: newRemaining,
        isRunning: false,
        lastTickAt: null,
      }
    }
    // Phase completed while app was closed.
    completedThisHydrate.push({
      instanceId: inst.id,
      durationSec: inst.durationSec,
      phase: inst.phase,
    })
    return {
      ...inst,
      remainingSec: 0,
      phase: 'complete',
      isRunning: false,
      lastTickAt: null,
    }
  })

  set({
    instances: restored,
    primaryId: persisted.primaryId ?? null,
    settings: persisted.settings ?? get().settings,
    tags: persisted.tags ?? [],
    goals: persisted.goals ?? get().goals,
    milestones: persisted.milestones ?? [],
    todaysCompletedSessions: persisted.todaysCompletedSessions ?? 0,
    todaysFocusMinutes: persisted.todaysFocusMinutes ?? 0,
    weeklyMinutes: persisted.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0],
    streakDays: persisted.streakDays ?? 0,
    todayKey: persisted.todayKey ?? today,
    lastSessionDayKey: persisted.lastSessionDayKey ?? null,
    customPresets: persisted.customPresets ?? [],
    pinnedBuiltInIds: persisted.pinnedBuiltInIds ?? [],
    pendingResumeIds,
    isHydrated: true,
  })

  // Roll counters if day changed.
  const roll = rollDailyCounters(get())
  if (roll.changed) set(roll.patch)

  // Replay any completions that happened while the app was closed.
  for (const c of completedThisHydrate) {
    logCompletedSessionAction(get, set, c.instanceId, c.durationSec, c.phase)
  }

  schedulePersist(get)
}
