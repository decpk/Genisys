import { useSettingsStore } from '@/store/settings-store'

export function useClipboardAddOnceSettingData() {
  const clipboardAddOnce = useSettingsStore((s) => s.clipboardAddOnce)
  const setClipboardAddOnce = useSettingsStore((s) => s.setClipboardAddOnce)
  return { clipboardAddOnce, setClipboardAddOnce }
}
