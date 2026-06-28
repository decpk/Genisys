import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useSettingsStore } from '@/store/settings-store'

export function useToggleActivityBarAction(): void {
  useBindShortcutActions({
    'global.toggleActivityBar': () => {
      useSettingsStore.getState().toggleActivityBar()
    },
  })
}
