import type { SettingsDrawerState } from '../settings-drawer-store.types'

export function toggleAction(
  get: () => SettingsDrawerState,
  set: (partial: Partial<SettingsDrawerState>) => void,
): void {
  set({ isOpen: !get().isOpen })
}
