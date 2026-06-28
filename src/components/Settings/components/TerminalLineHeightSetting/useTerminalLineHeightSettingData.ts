import { useSettingsStore } from '@/store/settings-store'

export function useTerminalLineHeightSettingData() {
  const value = useSettingsStore((s) => s.terminalLineHeight)
  const setValue = useSettingsStore((s) => s.setTerminalLineHeight)
  return { value, setValue }
}
