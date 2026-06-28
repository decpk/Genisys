import { useSettingsStore } from '@/store/settings-store'

export function useTerminalHistoryAutocompleteSettingData() {
  const value = useSettingsStore((s) => s.terminalHistoryAutocomplete)
  const setValue = useSettingsStore((s) => s.setTerminalHistoryAutocomplete)
  return { value, setValue }
}
