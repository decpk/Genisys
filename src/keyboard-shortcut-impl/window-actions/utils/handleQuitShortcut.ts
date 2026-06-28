import { useQuitConfirmStore } from '@/store/quit-confirm-store'

import { performQuit } from './performQuit'

/**
 * Cmd/Ctrl+Q handler.
 *
 * - First press: opens the quit confirmation modal so the user can see what
 *   they'd be losing (running timers, dirty notes, clipboard history, etc.).
 * - Second press (while the modal is already open): treats it as confirmation
 *   and quits the app — mirrors macOS's "press-and-hold to quit" muscle
 *   memory and lets keyboard-only users quit without reaching for the mouse.
 */
export function handleQuitShortcut(): void {
  const { isOpen, openQuitConfirm } = useQuitConfirmStore.getState()
  if (isOpen) {
    void performQuit()
    return
  }
  openQuitConfirm()
}
