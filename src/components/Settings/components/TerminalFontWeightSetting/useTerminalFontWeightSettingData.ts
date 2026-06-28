import { useSettingsStore } from '@/store/settings-store'

export function useTerminalFontWeightSettingData() {
  const value = useSettingsStore((s) => s.terminalFontWeight)
  const setValue = useSettingsStore((s) => s.setTerminalFontWeight)
  return { value, setValue }
}
