import { useSettingsStore } from '@/store/settings-store'

export function useTerminalFontLigaturesSettingData() {
  const value = useSettingsStore((s) => s.terminalFontLigatures)
  const setValue = useSettingsStore((s) => s.setTerminalFontLigatures)
  return { value, setValue }
}
