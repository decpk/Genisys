import type { QuitConfirmSet } from '../quit-confirm-store.types'

export function closeQuitConfirmAction(set: QuitConfirmSet): void {
  set({ isOpen: false })
}
