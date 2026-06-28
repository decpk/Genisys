import type { QuitConfirmSet } from '../quit-confirm-store.types'

export function markConfirmedQuitAction(set: QuitConfirmSet): void {
  set({ confirmedQuit: true })
}
