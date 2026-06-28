import type { StoreApi } from 'zustand'

import tauriApi from '@/tauri-api-bridge'

import type { KeepAwakeStore } from '../types'

/**
 * Turn keep-awake off. Reverts lid-close prevention first (it depends on the
 * main inhibitor and changes real OS sleep settings), then stops the inhibitor
 * + nudge and clears state. A failed stop records the message in `error`.
 */
export async function disableAction(
  set: StoreApi<KeepAwakeStore>['setState'],
  get: StoreApi<KeepAwakeStore>['getState'],
): Promise<void> {
  set({ isBusy: true })
  try {
    // Lid-close depends on the main inhibitor — undo it first so the OS sleep
    // settings are never left changed once Stay Awake is off.
    if (get().lidClose) {
      try {
        await tauriApi.keepAwakeLidSet(false)
      } catch {
        // Best-effort; the app-exit handler is the backstop.
      }
      set({ lidClose: false })
    }
    await tauriApi.keepAwakeStop()
    set({ isActive: false, error: null, pendingEnable: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    set({ error: message })
  } finally {
    set({ isBusy: false })
  }
}
