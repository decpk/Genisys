import { useSettingsStore } from '@/store/settings-store'

export function useTerminalFontSizeSettingData() {
  const value = useSettingsStore((s) => s.terminalFontSize)
  const setValue = useSettingsStore((s) => s.setTerminalFontSize)
  return { value, setValue }
}
