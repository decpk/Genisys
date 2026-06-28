import { create } from 'zustand'

import { APP_DATA_DEFAULTS } from './app-data'
import {
  addPresetAction,
  addTagAction,
  assignTagAction,
  bindToTaskAction,
  closeNewTimerDialogAction,
  createInstanceAction,
  dismissPendingResumeAction,
  duplicatePresetAction,
  hydrateAction,
  logCompletedSessionAction,
  openNewTimerDialogAction,
  pauseTimerAction,
  removeInstanceAction,
  removePresetAction,
  removeTagAction,
  resetTimerAction,
  resumePendingAction,
  setPrimaryAction,
  skipPhaseAction,
  startTimerAction,
  tickAction,
  togglePresetPinAction,
  updateGoalsAction,
  updatePresetAction,
  updateSettingsAction,
} from './timer-store/actions'
import type {
  TimerSettings,
  TimerStoreActions,
  TimerStoreState,
} from './timer-store/timer-store.types'

const FALLBACK_SETTINGS: TimerSettings = {
  defaultDurationSec: 1500,
  shortBreakDurationSec: 300,
  longBreakDurationSec: 900,
  sessionsBetweenLongBreak: 4,
  soundProfileId: 'gentle-bell',
  themeId: 'default',
  autoStartBreak: true,
  notificationsEnabled: true,
  showTrayCountdown: true,
  sidebarRowProgressBg: false,
  lastView: 'focus',
}

const DEFAULT_SETTINGS: TimerSettings =
  APP_DATA_DEFAULTS.settings.timer ?? FALLBACK_SETTINGS

const initialState: TimerStoreState = {
  instances: [],
  primaryId: null,
  isHydrated: false,
  settings: DEFAULT_SETTINGS,
  tags: [],
  goals: {
    dailyMinutesTarget: 120,
    weeklyMinutesTarget: 600,
    perTaskTargets: [],
  },
  milestones: [],
  todaysCompletedSessions: 0,
  todaysFocusMinutes: 0,
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
  streakDays: 0,
  todayKey: null,
  lastSessionDayKey: null,
  isNewTimerDialogOpen: false,
  pendingResumeIds: [],
  customPresets: [],
  pinnedBuiltInIds: [],
}

export const useTimerStore = create<TimerStoreState & TimerStoreActions>()(
  (set, get) => ({
    ...initialState,

    hydrate: () => hydrateAction(get, set),
    createInstance: (input) => createInstanceAction(get, set, input),
    removeInstance: (id) => removeInstanceAction(get, set, id),
    setPrimary: (id) => setPrimaryAction(get, set, id),
    startTimer: (id) => startTimerAction(get, set, id),
    pauseTimer: (id) => pauseTimerAction(get, set, id),
    resetTimer: (id) => resetTimerAction(get, set, id),
    skipPhase: (id) => skipPhaseAction(get, set, id),
    tick: () => tickAction(get, set),
    logCompletedSession: (instanceId, durationSec, phase) =>
      logCompletedSessionAction(get, set, instanceId, durationSec, phase),
    updateSettings: (partial) => updateSettingsAction(get, set, partial),
    updateGoals: (partial) => updateGoalsAction(get, set, partial),
    addTag: (input) => addTagAction(get, set, input),
    removeTag: (id) => removeTagAction(get, set, id),
    assignTag: (instanceId, tagId) =>
      assignTagAction(get, set, instanceId, tagId),
    bindToTask: (instanceId, dailyPlanTaskId) =>
      bindToTaskAction(get, set, instanceId, dailyPlanTaskId),
    openNewTimerDialog: () => openNewTimerDialogAction(get, set),
    closeNewTimerDialog: () => closeNewTimerDialogAction(get, set),
    resumePending: (ids) => resumePendingAction(get, set, ids),
    dismissPendingResume: () => dismissPendingResumeAction(get, set),
    addPreset: (input) => addPresetAction(get, set, input),
    updatePreset: (input) => updatePresetAction(get, set, input),
    removePreset: (id) => removePresetAction(get, set, id),
    duplicatePreset: (source) => duplicatePresetAction(get, set, source),
    togglePresetPin: (id) => togglePresetPinAction(get, set, id),
  }),
)
