import type { QuitConfirmSet } from '../quit-confirm-store.types'

export function openQuitConfirmAction(set: QuitConfirmSet): void {
  set({ isOpen: true })
}
