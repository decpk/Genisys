import { useSettingsStore } from '@/store/settings-store'

export function useTerminalFontFamilySettingData() {
  const value = useSettingsStore((s) => s.terminalFontFamily)
  const setValue = useSettingsStore((s) => s.setTerminalFontFamily)
  return { value, setValue }
}
