import { useTimerStore } from '@/store/timer-store'

import type { SettingsPanelData } from '../SettingsPanel.types'

export function useSettingsPanelData(): SettingsPanelData {
  const settings = useTimerStore((s) => s.settings)
  const updateSettings = useTimerStore((s) => s.updateSettings)
  return { settings, updateSettings }
}
