import type { StoreApi } from 'zustand'

import { notify } from '@/frameworks/notification/notify'

import {
  getTodayKey,
  persistImmediate,
  schedulePersist,
} from '../timer-store.persistence'
import { checkMilestones } from '../utils/checkMilestones'
import { createMilestoneId } from '../utils/createMilestoneId'
import { createSessionId } from '../utils/createSessionId'
import { getMilestoneLabel } from '../utils/getMilestoneLabel'
import { recomputeStreak } from '../utils/recomputeStreak'
import { rollDailyCounters } from '../utils/rollDailyCounters'
import type {
  TimerPhase,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

interface MaybeApi {
  saveTimerSession?: (payload: {
    id: string
    instanceId: string
    mode: string
    phase: string
    taskId?: string
    dailyPlanTaskId?: string
    tagId?: string
    startedAt: number
    completedAt: number
    durationSec: number
    wasCompleted: boolean
  }) => Promise<unknown> | unknown
  saveTimerMilestone?: (key: string) => Promise<unknown> | unknown
}

/**
 * Records a completed session. Updates daily/weekly aggregates and
 * streak. Persists to SQLite via `window.api.saveTimerSession` when
 * available — silently no-ops if the Tauri command isn't wired yet.
 */
export function logCompletedSessionAction(
  get: Getter,
  set: Setter,
  instanceId: string,
  durationSec: number,
  phase: TimerPhase,
): void {
  // Roll counters first so today's totals land in the correct day bucket.
  const roll = rollDailyCounters(get())
  if (roll.changed) set(roll.patch)

  const state = get()
  const today = state.todayKey ?? getTodayKey()
  const minutes = Math.max(0, Math.round(durationSec / 60))
  const isWork = phase === 'work' || phase === 'running'

  const inst = state.instances.find((i) => i.id === instanceId)

  let nextSessions = state.todaysCompletedSessions
  let nextMinutes = state.todaysFocusMinutes
  let weekly = state.weeklyMinutes
  let streakDays = state.streakDays
  let lastSessionDayKey = state.lastSessionDayKey

  if (isWork) {
    nextSessions = state.todaysCompletedSessions + 1
    nextMinutes = state.todaysFocusMinutes + minutes
    weekly = [...state.weeklyMinutes]
    weekly[0] = (weekly[0] ?? 0) + minutes
    streakDays = recomputeStreak(state.streakDays, today, state.lastSessionDayKey)
    lastSessionDayKey = today
  }

  set({
    todaysCompletedSessions: nextSessions,
    todaysFocusMinutes: nextMinutes,
    weeklyMinutes: weekly,
    streakDays,
    lastSessionDayKey,
  })

  // Best-effort persistence to Tauri/SQLite — skip silently if not available.
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.saveTimerSession === 'function' && inst) {
    const completedAt = Date.now()
    try {
      void api.saveTimerSession({
        id: createSessionId(),
        instanceId,
        mode: inst.mode,
        phase,
        taskId: inst.taskId,
        dailyPlanTaskId: inst.dailyPlanTaskId,
        tagId: inst.tagId,
        startedAt: completedAt - durationSec * 1000,
        completedAt,
        durationSec,
        wasCompleted: true,
      })
    } catch {
      /* noop — backend command unavailable */
    }
  }

  // Milestones — compute against post-update state.
  const newKeys = checkMilestones(get())
  if (newKeys.length > 0) {
    const ts = Date.now()
    const additions = newKeys.map((key) => ({
      id: createMilestoneId(),
      key,
      achievedAt: ts,
    }))
    set({ milestones: [...get().milestones, ...additions] })
    for (const key of newKeys) {
      if (typeof api?.saveTimerMilestone === 'function') {
        try {
          void api.saveTimerMilestone(key)
        } catch {
          /* noop */
        }
      }
      const settings = get().settings
      if (settings.notificationsEnabled) {
        notify({
          source: 'timer',
          type: 'success',
          message: `Milestone unlocked: ${getMilestoneLabel(key)}`,
        })
      }
    }
    persistImmediate(get)
    return
  }

  schedulePersist(get)
}
