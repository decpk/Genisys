import type { SettingsDrawerState } from '../settings-drawer-store.types'

export function openAction(
  set: (partial: Partial<SettingsDrawerState>) => void,
): void {
  set({ isOpen: true })
}
