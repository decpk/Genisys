import type { StoreApi } from 'zustand'

import tauriApi from '@/tauri-api-bridge'

import type { KeepAwakeStore } from '../types'

/**
 * Re-check macOS Accessibility trust and, if it is now granted while the store
 * is "armed" (`pendingEnable`), fulfil the deferred enable: start the keep-awake
 * inhibitor + nudge and clear the notice.
 *
 * Called when the Genisys window regains focus (the user returning from System
 * Settings) and from the "I've enabled it — retry" button. A no-op unless armed.
 */
export async function recheckPermissionAction(
  set: StoreApi<KeepAwakeStore>['setState'],
  get: StoreApi<KeepAwakeStore>['getState'],
): Promise<void> {
  if (!get().pendingEnable) return

  try {
    const trusted = await tauriApi.accessibilityStatus()
    if (!trusted) {
      set({ permission: 'denied' })
      return
    }
    await tauriApi.keepAwakeStart()
    set({
      isActive: true,
      permission: 'granted',
      pendingEnable: false,
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    set({ error: message })
  }
}
