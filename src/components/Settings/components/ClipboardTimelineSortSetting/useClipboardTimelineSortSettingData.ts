import { useSettingsStore } from '@/store/settings-store'

export function useClipboardTimelineSortSettingData() {
  const clipboardTimelineSortDirection = useSettingsStore(
    (s) => s.clipboardTimelineSortDirection,
  )
  const setClipboardTimelineSortDirection = useSettingsStore(
    (s) => s.setClipboardTimelineSortDirection,
  )
  return { clipboardTimelineSortDirection, setClipboardTimelineSortDirection }
}
