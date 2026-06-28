import type { TimerPreset } from '../constants/timerPresets'

/**
 * A presentation-ready preset row. Built-ins are flagged so the UI knows
 * which actions to expose (Duplicate / Pin only vs full CRUD).
 */
export interface PresetRow {
  preset: TimerPreset
  isCustom: boolean
  isPinned: boolean
}

export interface PresetGroups {
  pinned: PresetRow[]
  builtIn: PresetRow[]
  custom: PresetRow[]
}
