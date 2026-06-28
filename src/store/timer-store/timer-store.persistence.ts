import type { StoreApi } from 'zustand'

import type {
  TimerPersistedShape,
  TimerStoreActions,
  TimerStoreState,
} from './timer-store.types'

export const TIMER_STORAGE_KEY = 'genisys:timer:v1'

const DEBOUNCE_MS = 500

type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

let debounceHandle: ReturnType<typeof setTimeout> | null = null

/** Returns local YYYY-MM-DD. */
export function getTodayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function readPersisted(): TimerPersistedShape | null {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TimerPersistedShape
  } catch {
    return null
  }
}

export function writePersisted(value: TimerPersistedShape): void {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* noop — storage may be full or unavailable */
  }
}

function snapshot(get: Getter): TimerPersistedShape {
  const s = get()
  return {
    instances: s.instances,
    primaryId: s.primaryId,
    settings: s.settings,
    tags: s.tags,
    goals: s.goals,
    milestones: s.milestones,
    todaysCompletedSessions: s.todaysCompletedSessions,
    todaysFocusMinutes: s.todaysFocusMinutes,
    weeklyMinutes: s.weeklyMinutes,
    streakDays: s.streakDays,
    todayKey: s.todayKey,
    lastSessionDayKey: s.lastSessionDayKey,
    customPresets: s.customPresets,
    pinnedBuiltInIds: s.pinnedBuiltInIds,
  }
}

export function persistImmediate(get: Getter): void {
  if (debounceHandle) {
    clearTimeout(debounceHandle)
    debounceHandle = null
  }
  writePersisted(snapshot(get))
}

export function schedulePersist(get: Getter): void {
  if (debounceHandle) clearTimeout(debounceHandle)
  debounceHandle = setTimeout(() => {
    debounceHandle = null
    writePersisted(snapshot(get))
  }, DEBOUNCE_MS)
}
