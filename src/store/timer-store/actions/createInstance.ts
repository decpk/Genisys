import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import { createTimerInstanceId } from '../utils/createTimerInstanceId'
import type {
  CreateTimerInstanceInput,
  TimerInstance,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function createInstanceAction(
  get: Getter,
  set: Setter,
  input: CreateTimerInstanceInput,
): string {
  const {
    mode,
    name,
    durationSec,
    themeId,
    soundProfileId,
    tagId,
    dailyPlanTaskId,
    autoStartBreak,
  } = input
  const state = get()
  const settings = state.settings
  const id = createTimerInstanceId()
  const now = Date.now()

  const resolvedDuration =
    durationSec ??
    (mode === 'stopwatch' ? 0 : settings.defaultDurationSec)

  const initialPhase: TimerInstance['phase'] =
    mode === 'pomodoro' ? 'idle' : mode === 'stopwatch' ? 'paused' : 'idle'

  const resolvedName =
    name ??
    (mode === 'pomodoro' ? 'Pomodoro' : mode === 'stopwatch' ? 'Stopwatch' : 'Timer')

  const instance: TimerInstance = {
    id,
    mode,
    phase: initialPhase,
    name: resolvedName,
    durationSec: resolvedDuration,
    remainingSec: resolvedDuration,
    elapsedSec: 0,
    isRunning: false,
    lastTickAt: null,
    tagId,
    dailyPlanTaskId,
    themeId: themeId ?? settings.themeId,
    soundProfileId: soundProfileId ?? settings.soundProfileId,
    autoStartBreak: autoStartBreak ?? settings.autoStartBreak,
    sessionsBeforeLongBreak: settings.sessionsBetweenLongBreak,
    completedSessionsInCycle: 0,
    createdAt: now,
    updatedAt: now,
  }

  const nextInstances = [...state.instances, instance]
  const nextPrimary = state.primaryId ?? id
  set({ instances: nextInstances, primaryId: nextPrimary })
  schedulePersist(get)
  return id
}
