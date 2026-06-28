export type TimerMode = 'countdown' | 'pomodoro' | 'stopwatch'

export type TimerPhase =
  | 'idle'
  | 'work'
  | 'short-break'
  | 'long-break'
  | 'running'
  | 'paused'
  | 'complete'

export interface TimerInstance {
  id: string
  mode: TimerMode
  phase: TimerPhase
  name: string
  durationSec: number
  remainingSec: number
  elapsedSec: number
  isRunning: boolean
  lastTickAt: number | null
  taskId?: string
  dailyPlanTaskId?: string
  tagId?: string
  themeId: string
  soundProfileId: string
  autoStartBreak: boolean
  sessionsBeforeLongBreak: number
  completedSessionsInCycle: number
  createdAt: number
  updatedAt: number
}

export interface TimerTag {
  id: string
  name: string
  color: string
  createdAt: number
}

export interface TimerSettings {
  defaultDurationSec: number
  shortBreakDurationSec: number
  longBreakDurationSec: number
  sessionsBetweenLongBreak: number
  soundProfileId: string
  themeId: string
  autoStartBreak: boolean
  notificationsEnabled: boolean
  showTrayCountdown: boolean
  /** When true, the active timer row in the sidebar shows a faint colored fill behind itself representing progress. */
  sidebarRowProgressBg: boolean
  lastView: 'focus' | 'grid' | 'compact'
}

export interface TimerPerTaskTarget {
  taskId: string
  sessions?: number
  minutes?: number
}

export interface TimerGoals {
  dailyMinutesTarget: number
  weeklyMinutesTarget: number
  perTaskTargets: TimerPerTaskTarget[]
}

export interface TimerMilestone {
  id: string
  key: string
  achievedAt: number
}

export interface TimerSession {
  id: string
  instanceId: string
  mode: TimerMode
  phase: TimerPhase
  taskId?: string
  dailyPlanTaskId?: string
  tagId?: string
  startedAt: number
  completedAt: number
  durationSec: number
  wasCompleted: boolean
}

/**
 * A user-defined preset persisted in the timer store. Mirrors the
 * built-in `TimerPreset` shape but stores `iconKey` (a string lookup)
 * instead of a non-serializable `LucideIcon` reference.
 */
export interface TimerCustomPreset {
  id: string
  label: string
  mode: TimerMode
  durationSec: number
  breakSec?: number
  /** Lookup key into the curated icon registry; resolved at render time. */
  iconKey: string
  /** One-line tagline shown under the title in the hover popover. */
  tagline: string
  /** Long-form description: what it is, who it's for, when to use it. */
  description: string
  /** Short bullet list of best-fit use cases. */
  bestFor: string[]
  /** Optional preset-level overrides applied when an instance is created. */
  themeId?: string
  soundProfileId?: string
  autoStartBreak?: boolean
  pinned: boolean
  createdAt: number
  updatedAt: number
}

export interface AddCustomPresetInput {
  label: string
  mode: TimerMode
  durationSec: number
  breakSec?: number
  iconKey: string
  tagline: string
  description: string
  bestFor: string[]
  themeId?: string
  soundProfileId?: string
  autoStartBreak?: boolean
  pinned?: boolean
}

export interface UpdateCustomPresetInput {
  id: string
  label?: string
  mode?: TimerMode
  durationSec?: number
  breakSec?: number
  iconKey?: string
  tagline?: string
  description?: string
  bestFor?: string[]
  themeId?: string
  soundProfileId?: string
  autoStartBreak?: boolean
  pinned?: boolean
}

export interface TimerStoreState {
  instances: TimerInstance[]
  primaryId: string | null
  isHydrated: boolean
  settings: TimerSettings
  tags: TimerTag[]
  goals: TimerGoals
  milestones: TimerMilestone[]
  todaysCompletedSessions: number
  todaysFocusMinutes: number
  /** Length 7. Index 0 = today, 1 = yesterday, … 6 = six days ago. */
  weeklyMinutes: number[]
  streakDays: number
  todayKey: string | null
  lastSessionDayKey: string | null
  isNewTimerDialogOpen: boolean
  /**
   * Ids of instances that were running when the app last closed and still
   * have time remaining. Surfaced as a modal so the user can resume them.
   * Cleared via `dismissPendingResume`.
   */
  pendingResumeIds: string[]
  /** User-defined presets, persisted to localStorage. */
  customPresets: TimerCustomPreset[]
  /**
   * Ids of built-in presets the user has pinned. Built-ins themselves are
   * read-only constants, so pin state is stored separately.
   */
  pinnedBuiltInIds: string[]
}

export interface CreateTimerInstanceInput {
  mode: TimerMode
  name?: string
  durationSec?: number
  themeId?: string
  soundProfileId?: string
  tagId?: string
  dailyPlanTaskId?: string
  /** Optional override; falls back to `settings.autoStartBreak` when omitted. */
  autoStartBreak?: boolean
}

export interface AddTimerTagInput {
  name: string
  color: string
}

export interface TimerStoreActions {
  hydrate: () => void
  createInstance: (input: CreateTimerInstanceInput) => string
  removeInstance: (id: string) => void
  setPrimary: (id: string) => void
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  resetTimer: (id: string) => void
  skipPhase: (id: string) => void
  tick: () => void
  logCompletedSession: (
    instanceId: string,
    durationSec: number,
    phase: TimerPhase,
  ) => void
  updateSettings: (partial: Partial<TimerSettings>) => void
  updateGoals: (partial: Partial<TimerGoals>) => void
  addTag: (input: AddTimerTagInput) => string
  removeTag: (id: string) => void
  assignTag: (instanceId: string, tagId: string | null) => void
  bindToTask: (instanceId: string, dailyPlanTaskId: string | null) => void
  openNewTimerDialog: () => void
  closeNewTimerDialog: () => void
  /** Resumes the listed instances and clears `pendingResumeIds`. */
  resumePending: (ids: string[]) => void
  /** Clears `pendingResumeIds` without starting them. */
  dismissPendingResume: () => void
  /** Creates a new custom preset. Returns the new preset id. */
  addPreset: (input: AddCustomPresetInput) => string
  /** Patches an existing custom preset by id. No-op for unknown ids. */
  updatePreset: (input: UpdateCustomPresetInput) => void
  /** Removes a custom preset by id. No-op for unknown / built-in ids. */
  removePreset: (id: string) => void
  /**
   * Duplicates a preset (built-in or custom) into a new custom preset,
   * suffixed with " (Copy)". Caller passes a source-shaped input — the
   * store stays decoupled from the built-in registry. Returns the new id.
   */
  duplicatePreset: (source: AddCustomPresetInput) => string
  /**
   * Toggles pin state for any preset id. For built-ins, pin state is
   * tracked in `pinnedBuiltInIds`; for customs, the `pinned` field is
   * flipped on the preset itself.
   */
  togglePresetPin: (id: string) => void
}

export interface TimerPersistedShape {
  instances: TimerInstance[]
  primaryId: string | null
  settings: TimerSettings
  tags: TimerTag[]
  goals: TimerGoals
  milestones: TimerMilestone[]
  todaysCompletedSessions: number
  todaysFocusMinutes: number
  weeklyMinutes: number[]
  streakDays: number
  todayKey: string | null
  lastSessionDayKey: string | null
  customPresets: TimerCustomPreset[]
  pinnedBuiltInIds: string[]
}
