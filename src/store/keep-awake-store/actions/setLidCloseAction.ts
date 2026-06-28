import type { StoreApi } from 'zustand'

import tauriApi from '@/tauri-api-bridge'

import type { KeepAwakeStore } from '../types'

/**
 * Toggle "keep awake even when the lid is closed".
 *
 * This is additive to the main idle inhibitor and depends on it, so it is only
 * applied while the main "Stay Awake" feature is active (the UI also disables
 * the checkbox otherwise). On macOS/Windows the backend triggers an admin
 * prompt; on Linux it holds a `systemd-inhibit` lock with no prompt. On
 * failure (e.g. the admin prompt was declined) the checkbox reverts to off and
 * the reason is recorded in `lidError`.
 */
export async function setLidCloseAction(
  set: StoreApi<KeepAwakeStore>['setState'],
  get: StoreApi<KeepAwakeStore>['getState'],
  enabled: boolean,
): Promise<void> {
  // Lid-close only makes sense alongside the active idle inhibitor.
  if (enabled && !get().isActive) return

  set({ isLidBusy: true, lidError: null })
  try {
    await tauriApi.keepAwakeLidSet(enabled)
    set({ lidClose: enabled })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    set({ lidClose: false, lidError: message })
  } finally {
    set({ isLidBusy: false })
  }
}
