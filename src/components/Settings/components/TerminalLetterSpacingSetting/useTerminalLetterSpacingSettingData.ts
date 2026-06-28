import { useSettingsStore } from '@/store/settings-store'

export function useTerminalLetterSpacingSettingData() {
  const value = useSettingsStore((s) => s.terminalLetterSpacing)
  const setValue = useSettingsStore((s) => s.setTerminalLetterSpacing)
  return { value, setValue }
}
