import type { TimerPreset } from '../../../../constants/timerPresets'

export interface PresetsSectionProps {
  onPresetSelect: (preset: TimerPreset) => void
}
