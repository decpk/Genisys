import { useTimerStore } from '@/store/timer-store'

import { TIMER_PRESETS, type TimerPreset } from '../constants/timerPresets'

import { customPresetToTimerPreset } from './customPresetToTimerPreset'

/**
 * Looks up a preset by id across both built-ins and the user's custom
 * presets. Custom presets are mapped through `customPresetToTimerPreset`
 * so callers always see the same `TimerPreset` shape.
 */
export function getPresetById(id: string): TimerPreset | undefined {
  const builtIn = TIMER_PRESETS.find((p) => p.id === id)
  if (builtIn) return builtIn
  const custom = useTimerStore.getState().customPresets.find((p) => p.id === id)
  if (custom) return customPresetToTimerPreset(custom)
  return undefined
}
