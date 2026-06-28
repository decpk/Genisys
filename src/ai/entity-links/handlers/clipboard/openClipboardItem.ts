import { useClipboardStore } from '@/store/clipboard-store'
import { useSettingsStore } from '@/store/settings-store'

export function openClipboardItem(id: string): void {
  // A disabled Clipboard app must not be opened or operated, even via an AI
  // entity link (which bypasses the central setActiveApp navigation gate).
  if (!useSettingsStore.getState().isAppEnabled('clipboard')) return
  useClipboardStore.getState().openPreview(id)
}
