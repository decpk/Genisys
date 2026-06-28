import { useSettingsStore } from '@/store/settings-store'

export function useTerminalPromptAutoRunSettingData() {
  const value = useSettingsStore((s) => s.terminalInsertPromptAutoRun)
  const setValue = useSettingsStore((s) => s.setTerminalInsertPromptAutoRun)
  return { value, setValue }
}
