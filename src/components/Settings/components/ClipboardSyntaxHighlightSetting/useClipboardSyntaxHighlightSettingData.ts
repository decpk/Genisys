import { useSettingsStore } from '@/store/settings-store'

export function useClipboardSyntaxHighlightSettingData() {
  const clipboardSyntaxHighlightCode = useSettingsStore((s) => s.clipboardSyntaxHighlightCode)
  const setClipboardSyntaxHighlightCode = useSettingsStore((s) => s.setClipboardSyntaxHighlightCode)
  return { clipboardSyntaxHighlightCode, setClipboardSyntaxHighlightCode }
}
