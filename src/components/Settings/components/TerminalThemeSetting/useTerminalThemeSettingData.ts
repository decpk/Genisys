import { useSettingsStore } from '@/store/settings-store'

export function useTerminalThemeSettingData() {
  const value = useSettingsStore((s) => s.terminalDefaultThemeId)
  const setValue = useSettingsStore((s) => s.setTerminalDefaultThemeId)
  return { value, setValue }
}
