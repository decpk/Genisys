import { useSettingsStore } from '@/store/settings-store'

export function useClipboardMaxItemsSettingData() {
  const clipboardMaxItems = useSettingsStore((s) => s.clipboardMaxItems)
  const setClipboardMaxItems = useSettingsStore((s) => s.setClipboardMaxItems)

  return { clipboardMaxItems, setClipboardMaxItems }
}
