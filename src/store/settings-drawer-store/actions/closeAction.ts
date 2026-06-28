import type { SettingsDrawerState } from '../settings-drawer-store.types'

export function closeAction(
  set: (partial: Partial<SettingsDrawerState>) => void,
): void {
  set({ isOpen: false })
}
